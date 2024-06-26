import type * as SpeechRecognition from 'dom-speech-recognition';
import type VisRxWidget from '@/Vis/visRxWidget';

declare global {
    interface Window {
        webkitSpeechRecognition?: SpeechRecognition;
        /** The vis-2 adapter instance */
        visAdapterInstance?: number;
        visRxWidget?: VisRxWidget;
        visConfigLoaded?: Promise<void>;
    }
}
