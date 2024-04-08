import type * as SpeechRecognition from 'dom-speech-recognition';

declare global {
    interface Window {
        webkitSpeechRecognition?: SpeechRecognition;
        /** The vis-2 adapter instance */
        visAdapterInstance?: number;
    }
}
