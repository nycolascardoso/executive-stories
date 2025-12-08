import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, placeholder = "Clique para iniciar a gravação de voz...", disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError("Reconhecimento de voz não suportado neste navegador");
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported || disabled) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    setError(null);
    setTranscript("");
    
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      setTranscript(prev => {
        const newTranscript = prev + finalTranscript;
        return newTranscript || interimTranscript;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setError("Nenhuma fala detectada. Tente novamente.");
      } else if (event.error === "audio-capture") {
        setError("Microfone não encontrado. Verifique as permissões.");
      } else if (event.error === "not-allowed") {
        setError("Permissão de microfone negada. Habilite nas configurações.");
      } else {
        setError("Erro no reconhecimento de voz. Tente novamente.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, disabled]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript("");
    }
  }, [transcript, onTranscript]);

  const handleCancel = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  if (!isSupported) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4 text-center">
          <MicOff className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Reconhecimento de voz não suportado neste navegador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          className={`${isRecording ? "" : "btn-game-primary"} min-w-[180px]`}
          data-testid="button-voice-record"
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.span
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                Processando...
              </motion.span>
            ) : isRecording ? (
              <motion.span
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Square className="h-5 w-5" />
                </motion.div>
                Parar Gravação
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Mic className="h-5 w-5" />
                Gravar Discurso
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm text-muted-foreground">Gravando...</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-4 space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Transcrição
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-voice-transcript">
                  {transcript}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    data-testid="button-voice-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    data-testid="button-voice-confirm"
                  >
                    Usar Transcrição
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
