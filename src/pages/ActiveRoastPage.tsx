import React, { useState, useRef, useEffect } from 'react';
import { OvenId, AnalysisResult } from '../types/roast';
import { useRoast } from '../contexts/RoastContext';
import { analyticsEngine } from '../services/analyticsEngine';
import { roboflowService } from '../services/roboflowService';
import { formatSecondsToMMSS, getStageLabel, getStageBadgeStyles } from '../utils/formatters';
import { RoastStageProgressBar } from '../components/roast/RoastStageProgressBar';
import { RoastTimeline } from '../components/roast/RoastTimeline';
import { HumanFeedbackButtons } from '../components/aiFeedback/HumanFeedbackButtons';
import { CameraCaptureModal } from '../components/roast/CameraCaptureModal';
import { Camera, Upload, Square, User, Award, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ActiveRoastPageProps {
  ovenId: OvenId;
  onBack: () => void;
}

export const ActiveRoastPage: React.FC<ActiveRoastPageProps> = ({ ovenId, onBack }) => {
  const { getOvenSession, finishRoast, addAnalysis, recordHumanFeedback } = useRoast();
  const session = getOvenSession(ovenId);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (session && session.analyses.length > 0) {
      setLatestAnalysis(session.analyses[session.analyses.length - 1]);
    }
  }, [session]);

  useEffect(() => {
    if (latestAnalysis && canvasRef.current && imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        roboflowService.drawDetectionsOnCanvas(
          canvasRef.current,
          img,
          latestAnalysis.detectedObjects,
          latestAnalysis.stage
        );
      } else {
        img.onload = () => {
          if (canvasRef.current) {
            roboflowService.drawDetectionsOnCanvas(
              canvasRef.current,
              img,
              latestAnalysis.detectedObjects,
              latestAnalysis.stage
            );
          }
        };
      }
    }
  }, [latestAnalysis]);

  if (!session) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-industrial-textMuted mx-auto" />
        <h3 className="text-lg font-bold text-white">Nenhuma torra ativa no Forno {ovenId}</h3>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-industrial-accent text-white font-bold rounded-xl"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const estimate = analyticsEngine.getPredictiveEstimate(ovenId, session.durationSeconds);

  const handleProcessImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const detection = await roboflowService.detectObject(base64Image);

      const createdAnalysis = await addAnalysis(ovenId, {
        timeInRoastSeconds: session.durationSeconds,
        stage: detection.stage,
        confidence: detection.confidence,
        detectedObjects: detection.detectedObjects,
        imageUrl: base64Image,
      });

      setLatestAnalysis(createdAnalysis);
    } catch (err) {
      console.error('Erro na análise:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          handleProcessImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHumanFeedback = (feedback: 'agreed' | 'disagreed', correctedStage?: any) => {
    if (latestAnalysis) {
      recordHumanFeedback(ovenId, latestAnalysis.id, feedback, correctedStage);
      setLatestAnalysis(prev => prev ? {
        ...prev,
        humanFeedback: feedback,
        correctedStage,
      } : null);
    }
  };

  const handleFinish = () => {
    if (window.confirm(`Tem certeza que deseja FINALIZAR a torra do Forno ${ovenId}?`)) {
      finishRoast(ovenId);
      onBack();
    }
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 bg-industrial-card border border-industrial-border rounded-xl text-xs font-bold text-industrial-textSecondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Fornos
        </button>

        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">SESSÃO ATIVA</span>
        </div>
      </div>

      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-b from-industrial-card to-industrial-bg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border-b border-industrial-border pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 font-mono font-extrabold text-2xl flex items-center justify-center border border-emerald-500/40 shadow-success-glow">
              F{ovenId}
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white font-mono">FORNO {ovenId} — TORRA EM ANDAMENTO</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-industrial-textSecondary mt-0.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Operador: <strong className="text-white">{session.operatorName}</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-industrial-bg border border-industrial-border px-6 py-3 rounded-2xl shadow-inner">
            <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block text-center mb-0.5">
              TEMPO DECORRIDO
            </span>
            <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {formatSecondsToMMSS(session.durationSeconds)}
            </span>
          </div>
        </div>

        <div className="bg-industrial-cardHover border border-industrial-borderActive p-3.5 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-industrial-accent flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white">Assistente de Produção Preditivo: </span>
            <span className="text-industrial-textSecondary">{estimate.message}</span>
            <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-industrial-textMuted">
              <span>Média do Forno: ~{Math.floor(estimate.estimatedTotalDurationSeconds / 60)} min</span>
              <span>•</span>
              <span>Progresso Estimado: {estimate.progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setIsCameraOpen(true)}
          disabled={isAnalyzing}
          className="w-full h-20 bg-gradient-to-r from-industrial-accent via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-scada-glow flex items-center justify-center gap-4 text-xl tracking-wide active:scale-98 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>ANALISANDO COM ROBOFLOW IA...</span>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8" />
              <span>📷 TIRAR FOTO DA TORRA</span>
            </>
          )}
        </button>

        <label className="w-full h-12 bg-industrial-card border border-industrial-border hover:border-industrial-borderActive text-industrial-textSecondary hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-98">
          <Upload className="w-4 h-4 text-purple-400" />
          📁 FAZER UPLOAD DE FOTO
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <RoastStageProgressBar
        currentStage={latestAnalysis ? latestAnalysis.stage : null}
        confidence={latestAnalysis ? latestAnalysis.confidence : undefined}
      />

      {latestAnalysis && (
        <div className="bg-industrial-card border border-industrial-border rounded-2xl p-5 shadow-scada space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              ÚLTIMA ANÁLISE ROBOFLOW
            </h3>
            {(() => {
              const styles = getStageBadgeStyles(latestAnalysis.stage);
              return (
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}>
                  {getStageLabel(latestAnalysis.stage)} ({latestAnalysis.confidence}%)
                </span>
              );
            })()}
          </div>

          <div className="relative w-full rounded-xl overflow-hidden bg-industrial-bg border border-industrial-border">
            <img
              ref={imageRef}
              src={latestAnalysis.imageUrl}
              alt="Análise de Torra"
              className="hidden"
            />
            <canvas
              ref={canvasRef}
              className="w-full h-auto block rounded-xl"
            />
          </div>

          <HumanFeedbackButtons
            currentStage={latestAnalysis.stage}
            currentFeedback={latestAnalysis.humanFeedback}
            onFeedback={handleHumanFeedback}
          />
        </div>
      )}

      <RoastTimeline events={session.timeline} />

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-industrial-card/95 backdrop-blur-md border-t border-industrial-border p-4 shadow-2xl">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleFinish}
            className="w-full h-14 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold rounded-xl shadow-danger-glow flex items-center justify-center gap-3 text-lg tracking-wider active:scale-98 transition-all"
          >
            <Square className="w-6 h-6 fill-current" />
            🛑 FINALIZAR TORRA
          </button>
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleProcessImage}
      />
    </div>
  );
};
