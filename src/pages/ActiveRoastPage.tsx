import React, { useState, useRef, useEffect } from 'react';
import { OvenId, AnalysisResult } from '../types/roast';
import { useRoast } from '../contexts/RoastContext';
import { analyticsEngine } from '../services/analyticsEngine';
import { roboflowService } from '../services/roboflowService';
import { formatSecondsToMMSS, getStageLabel, getStageBadgeStyles } from '../utils/formatters';
import { RoastStageProgressBar } from '../components/roast/RoastStageProgressBar';
import { HumanFeedbackButtons } from '../components/aiFeedback/HumanFeedbackButtons';
import { CameraCaptureModal } from '../components/roast/CameraCaptureModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { NewRoastModal } from '../components/oven/NewRoastModal';
import { Camera, Upload, Square, User, Award, ArrowLeft, Loader2, Clock, TrendingUp, AlertCircle, Plus } from 'lucide-react';

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
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isNewRoastModalOpen, setIsNewRoastModalOpen] = useState(false);

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

  const estimate = analyticsEngine.getPredictiveEstimate(ovenId, session.durationSeconds, session.startTime);

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

  const handleConfirmFinish = () => {
    finishRoast(ovenId);
    setIsFinishModalOpen(false);
    onBack();
  };

  return (
    <div className="space-y-6 pb-44">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 bg-industrial-card border border-industrial-border rounded-xl text-xs font-bold text-industrial-textSecondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Fornos
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsNewRoastModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-success-glow transition-all active:scale-95 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Iniciar Nova Torra</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">SESSÃO ATIVA</span>
          </div>
        </div>
      </div>

      {/* Main SCADA Header Box */}
      <div className="bg-industrial-card border border-industrial-border rounded-3xl p-6 shadow-scada bg-gradient-to-b from-industrial-card to-industrial-bg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border-b border-industrial-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 font-mono font-extrabold text-2xl flex items-center justify-center border border-emerald-500/40 shadow-success-glow">
              F{ovenId}
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white font-mono">FORNO {ovenId} — TORRA EM ANDAMENTO</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-industrial-textSecondary mt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Operador: <strong className="text-white">{session.operatorName}</strong></span>
                </div>
                <button
                  onClick={() => setIsNewRoastModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] rounded-lg transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Iniciar Nova Torra</span>
                </button>
              </div>
            </div>
          </div>

          {/* Digital Timer */}
          <div className="bg-industrial-bg border border-industrial-border px-6 py-3 rounded-2xl shadow-inner">
            <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block text-center mb-0.5">
              TEMPO DECORRIDO
            </span>
            <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {formatSecondsToMMSS(session.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Estimated Time and Estimated Percentage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Tempo Estimado */}
          <div className="bg-industrial-bg border border-industrial-border rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-industrial-accent/20 border border-industrial-accent/40 text-industrial-accent flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">
                  Tempo Estimado
                </span>
                <span className="font-mono text-lg font-black text-white">
                  ~{Math.floor(estimate.estimatedTotalDurationSeconds / 60)} min
                </span>
              </div>
            </div>

            {estimate.isFirstRoastOfDay && (
              <span className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                🔥 Forno Frio
              </span>
            )}
          </div>

          {/* Porcentagem Estimada */}
          <div className="bg-industrial-bg border border-industrial-border rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-industrial-textMuted uppercase tracking-wider block">
                  Porcentagem Estimada
                </span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  {estimate.progressPercentage}%
                </span>
              </div>
            </div>

            {/* Progress Mini Bar */}
            <div className="w-16 bg-industrial-card border border-industrial-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, estimate.progressPercentage)}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Primary Action (Huge Camera Button) */}
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

      {/* Sticky Bottom Finish Button */}
      <div className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 z-40 bg-industrial-card/95 backdrop-blur-md border-t border-industrial-border p-3 sm:p-4 shadow-2xl">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => setIsFinishModalOpen(true)}
            className="w-full h-14 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold rounded-xl shadow-danger-glow flex items-center justify-center gap-3 text-lg tracking-wider active:scale-98 transition-all"
          >
            <Square className="w-6 h-6 fill-current" />
            🛑 FINALIZAR TORRA
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleProcessImage}
      />

      {/* Custom Confirmation Modal for Finishing Roast */}
      <ConfirmModal
        isOpen={isFinishModalOpen}
        title="Finalizar Torra"
        message={`Tem certeza que deseja finalizar a torra no Forno ${ovenId}? A sessão de monitoramento será encerrada e gravada no histórico.`}
        variant="danger"
        confirmText="Finalizar Torra"
        cancelText="Continuar Torra"
        onConfirm={handleConfirmFinish}
        onCancel={() => setIsFinishModalOpen(false)}
      />

      {/* Modal para Iniciar Nova Torra */}
      {isNewRoastModalOpen && (
        <NewRoastModal
          ovenId={ovenId}
          suggestDifferentOven={true}
          onClose={() => setIsNewRoastModalOpen(false)}
          onRoastStarted={() => {
            setLatestAnalysis(null);
            setIsNewRoastModalOpen(false);
          }}
        />
      )}

    </div>
  );
};
