import { useRef, useCallback, useMemo } from "react";

const DEFAULT_DEBUG_AUDIO = true;
const DEFAULT_DEBUG_AUDIO_VERBOSE = false;
const DEFAULT_SILENCE_TIMEOUT_MS = 1750;
const DEFAULT_VOL_THRESHOLD_PERC = 2;
const DEFAULT_INITIAL_GRACE_MS = 3000;

export default function useRecorder(options) {
    const DEBUG_AUDIO = options?.DEBUG_AUDIO ?? DEFAULT_DEBUG_AUDIO;
    const DEBUG_AUDIO_VERBOSE = options?.DEBUG_AUDIO_VERBOSE ?? DEFAULT_DEBUG_AUDIO_VERBOSE;
    const SILENCE_TIMEOUT_MS = options?.SILENCE_TIMEOUT_MS ?? DEFAULT_SILENCE_TIMEOUT_MS;
    const VOL_THRESHOLD_PERC = options?.VOL_THRESHOLD_PERC ?? DEFAULT_VOL_THRESHOLD_PERC;
    const INITIAL_GRACE_MS = options?.INITIAL_GRACE_MS ?? DEFAULT_INITIAL_GRACE_MS;


    const audioBlobRef = useRef();
    const pastAudioBeginRef = useRef();
    const pastAudioRef = useRef([]);
    const isRecordingRef = useRef();
    const audioContextRef = useRef();
    const mediaRecorderRef = useRef();
    const analyzerRef = useRef();
    const audioChunksRef = useRef([]);
    const audioBufferRef = useRef();
    const uraRef = useRef();

    // Adapted from: https://stackoverflow.com/questions/7869752/javascript-typed-arrays-and-endianness
    const endian = useMemo(() => {
        let arrayBuffer = new ArrayBuffer(2);
        let uint8Array = new Uint8Array(arrayBuffer);
        let uint16array = new Uint16Array(arrayBuffer);
        uint8Array[0] = 0xAA; // set first byte
        uint8Array[1] = 0xBB; // set second byte
        if(uint16array[0] === 0xBBAA) return "little";
        if(uint16array[0] === 0xAABB) return "big";
        else throw new Error("Something crazy just happened!");
    }, []);

    const stopRecording = useCallback(() => {
        if (isRecordingRef.current) {
            mediaRecorderRef.current.addEventListener("dataavailable", event => {
                if (DEBUG_AUDIO) {
                    console.log("Audio chunks saved.");
                }
                audioChunksRef.current = [event.data];
            });
    
            mediaRecorderRef.current.addEventListener("stop", () => {
                if (DEBUG_AUDIO) {
                    console.log("Recording stopped.");
                }
                audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (typeof(uraRef.current) === 'function') {
                    uraRef.current();
                    uraRef.current = undefined;
                }
            });
    
            isRecordingRef.current = false;
            pastAudioBeginRef.current = undefined;
            pastAudioRef.current = [];
            audioContextRef.current?.close();
            audioContextRef.current = null;
            mediaRecorderRef.current?.stop();
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    const processAudioBlip = useCallback((ts) => {
        const dataArray = audioBufferRef.current;
        if (isRecordingRef.current) {
            const pastAudio = pastAudioRef.current;
            const pastAudioBegin = pastAudioBeginRef.current;
            if (pastAudioBegin === undefined) {
                requestAnimationFrame(processAudioBlip);
            } else {
                analyzerRef.current.getByteFrequencyData(dataArray);
                let sumAmpl = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sumAmpl += dataArray[i];
                }
    
                const currVol = (sumAmpl / (dataArray.length * 255)) * 100
                if (DEBUG_AUDIO && DEBUG_AUDIO_VERBOSE) {
                    console.log(Number.parseInt(Math.floor(ts - pastAudioBegin)), 'Volume: ', currVol);
                }
    
                if (ts - pastAudioBegin >= INITIAL_GRACE_MS) {
                    pastAudio.push({ts: ts, vol: currVol});
                }
    
                if (ts - pastAudioBegin >= (SILENCE_TIMEOUT_MS + INITIAL_GRACE_MS)) {
                    while(ts - pastAudio[0].ts >= SILENCE_TIMEOUT_MS) {
                        pastAudio.shift();
                    }
    
                    let sumRecentAudioVol = 0;
                    for (let i = 0; i < pastAudio.length; i++) {
                        sumRecentAudioVol += pastAudio[i].vol;
                    }
                    const avgRecentAudioVol = sumRecentAudioVol / pastAudio.length;
    
                    if (avgRecentAudioVol > VOL_THRESHOLD_PERC) {
                        requestAnimationFrame(processAudioBlip);
                    } else {
                        if (DEBUG_AUDIO) {
                            console.log(`Average volume over past ${SILENCE_TIMEOUT_MS}ms went below threshold of ${VOL_THRESHOLD_PERC}%, stopping recording...`);
                        }
                        stopRecording();
                    }
                } else {
                    requestAnimationFrame(processAudioBlip);
                }
            }
        } else {
            stopRecording();
        }
    }, []);

    const startRecording = useCallback((stopFunc) => {
        return new Promise(async (resolve, reject) => {
            uraRef.current = stopFunc;
            pastAudioRef.current = [];
            audioChunksRef.current = [];
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm', audioBitrateMode: "constant" });
                const source = audioContextRef.current.createMediaStreamSource(stream);
                analyzerRef.current = new AnalyserNode(audioContextRef.current);

                source.connect(analyzerRef.current);
                analyzerRef.current.fftSize = 2048;
                const bufferLength = analyzerRef.current.frequencyBinCount;
                audioBufferRef.current = new Uint8Array(bufferLength);
                source.connect(analyzerRef.current);

                isRecordingRef.current = true;
                processAudioBlip();                

                mediaRecorderRef.current.addEventListener('start', (e) => {
                    pastAudioBeginRef.current = e.timeStamp;
                    if (DEBUG_AUDIO) {
                        console.log("Beginning recording...");
                    }
                    resolve("Recording started!");
                })

                mediaRecorderRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone. Did you give it permission? ", err);
                reject("Recording failed to start, error accessing microphone. Did you give it permission?");
            }
        });
    }, []);

    const getRecordedRawSoundData = useCallback(async () => {
        const byts = await getRecordedCompression().arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(byts);
        return {
            sound: audioBuffer.getChannelData(0),
            contentType: `audio/raw;encoding=floating-point;bits=32;rate=${audioBuffer.sampleRate};endian=${endian}`
        }
    }, []);

    const getRecordedCompression = useCallback(() => {
        return audioBlobRef.current;
    }, []);

    const getRecordedCompressionAsURLObject = useCallback(() => {
        return URL.createObjectURL(audioBlobRef.current);
    }, []);

    const isRecording = useCallback(() => {
        return isRecordingRef.current;
    }, [])

    return {
        startRecording,
        stopRecording,
        isRecording,
        getRecordedRawSoundData,
        getRecordedCompression,
        getRecordedCompressionAsURLObject
    }
}