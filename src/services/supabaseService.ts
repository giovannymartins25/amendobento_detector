import { supabase } from './supabaseClient';
import { OvenConfig, RoastSession, AnalysisResult, PredictiveAlert, User } from '../types/roast';

export const supabaseService = {
  // --- FORNOS (OVENS) ---
  async fetchOvens(): Promise<OvenConfig[] | null> {
    try {
      const { data, error } = await supabase
        .from('ovens')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data) {
        if (error) console.warn('[Supabase] Erro ao buscar fornos:', error.message);
        return null;
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        status: item.status,
        isVisibleOnBoard: item.is_visible_on_board ?? false,
        installedAt: item.installed_at,
        notes: item.notes,
      }));
    } catch (e) {
      console.warn('[Supabase] Exceção ao consultar fornos:', e);
      return null;
    }
  },

  async upsertOvens(ovens: OvenConfig[]): Promise<boolean> {
    try {
      const payload = ovens.map(oven => ({
        id: oven.id,
        name: oven.name,
        status: oven.status,
        is_visible_on_board: oven.isVisibleOnBoard ?? false,
        installed_at: oven.installedAt,
        notes: oven.notes,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('ovens').upsert(payload);
      if (error) {
        console.warn('[Supabase] Erro ao salvar fornos:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao salvar fornos:', e);
      return false;
    }
  },

  // --- SESSÕES DE TORRA (ROAST SESSIONS) ---
  async fetchAnalyses(): Promise<AnalysisResult[] | null> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error || !data) {
        if (error) console.warn('[Supabase] Erro ao buscar análises:', error.message);
        return null;
      }

      return data.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        timeInRoastSeconds: item.time_in_roast_seconds,
        stage: item.stage,
        confidence: Number(item.confidence),
        detectedObjects: item.detected_objects || [],
        imageUrl: item.image_url || item.imageUrl || '',
        ovenId: item.oven_id,
        operatorName: item.operator_name || 'Operador',
        humanFeedback: item.human_feedback || undefined,
        correctedStage: item.corrected_stage || undefined,
        roastSessionId: item.roast_session_id || undefined,
      }));
    } catch (e) {
      console.warn('[Supabase] Exceção ao consultar análises:', e);
      return null;
    }
  },

  async saveAnalysis(analysis: AnalysisResult): Promise<boolean> {
    try {
      const payload = {
        id: analysis.id,
        roast_session_id: analysis.roastSessionId || null,
        timestamp: analysis.timestamp,
        time_in_roast_seconds: analysis.timeInRoastSeconds,
        stage: analysis.stage,
        confidence: analysis.confidence,
        detected_objects: analysis.detectedObjects || [],
        image_url: analysis.imageUrl,
        oven_id: analysis.ovenId,
        operator_name: analysis.operatorName || 'Operador',
        human_feedback: analysis.humanFeedback || null,
        corrected_stage: analysis.correctedStage || null,
      };

      const { error } = await supabase.from('analyses').upsert(payload);
      if (error) {
        console.warn('[Supabase] Erro ao salvar análise na tabela public.analyses:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao salvar análise:', e);
      return false;
    }
  },

  async fetchSessions(): Promise<RoastSession[] | null> {
    try {
      const { data: sessionsData, error: sessionsErr } = await supabase
        .from('roast_sessions')
        .select('*')
        .order('start_time', { ascending: false });

      if (sessionsErr || !sessionsData) {
        if (sessionsErr) console.warn('[Supabase] Erro ao buscar sessões:', sessionsErr.message);
        return null;
      }

      // Buscar análises associadas
      const { data: analysesData } = await supabase
        .from('analyses')
        .select('*');

      const analysesMap = new Map<string, AnalysisResult[]>();
      if (analysesData) {
        analysesData.forEach(item => {
          const analysis: AnalysisResult = {
            id: item.id,
            timestamp: item.timestamp,
            timeInRoastSeconds: item.time_in_roast_seconds,
            stage: item.stage,
            confidence: Number(item.confidence),
            detectedObjects: item.detected_objects || [],
            imageUrl: item.image_url,
            ovenId: item.oven_id,
            operatorName: item.operator_name,
            humanFeedback: item.human_feedback || undefined,
            correctedStage: item.corrected_stage || undefined,
            roastSessionId: item.roast_session_id || undefined,
          };
          const sessionId = item.roast_session_id;
          if (sessionId) {
            if (!analysesMap.has(sessionId)) analysesMap.set(sessionId, []);
            analysesMap.get(sessionId)!.push(analysis);
          }
        });
      }

      return sessionsData.map(item => ({
        id: item.id,
        ovenId: item.oven_id,
        operatorId: item.operator_id || '',
        operatorName: item.operator_name,
        startTime: item.start_time,
        endTime: item.end_time || undefined,
        durationSeconds: item.duration_seconds || 0,
        status: item.status,
        targetQuantityKg: item.target_quantity_kg ? Number(item.target_quantity_kg) : undefined,
        notes: item.notes || undefined,
        finalStage: item.final_stage || undefined,
        timeline: item.timeline || [],
        analyses: analysesMap.get(item.id) || [],
      }));
    } catch (e) {
      console.warn('[Supabase] Exceção ao consultar sessões:', e);
      return null;
    }
  },

  async saveSession(session: RoastSession): Promise<boolean> {
    try {
      const sessionPayload = {
        id: session.id,
        oven_id: session.ovenId,
        operator_id: session.operatorId || null,
        operator_name: session.operatorName,
        start_time: session.startTime,
        end_time: session.endTime || null,
        duration_seconds: session.durationSeconds,
        status: session.status,
        target_quantity_kg: session.targetQuantityKg || null,
        notes: session.notes || null,
        final_stage: session.finalStage || null,
        timeline: session.timeline || [],
      };

      const { error: sessionErr } = await supabase
        .from('roast_sessions')
        .upsert(sessionPayload);

      if (sessionErr) {
        console.warn('[Supabase] Erro ao salvar sessão de torra:', sessionErr.message);
        return false;
      }

      // Salvar análises da sessão se houver
      if (session.analyses && session.analyses.length > 0) {
        const analysesPayload = session.analyses.map(ans => ({
          id: ans.id,
          roast_session_id: session.id,
          timestamp: ans.timestamp,
          time_in_roast_seconds: ans.timeInRoastSeconds,
          stage: ans.stage,
          confidence: ans.confidence,
          detected_objects: ans.detectedObjects || [],
          image_url: ans.imageUrl,
          oven_id: ans.ovenId,
          operator_name: ans.operatorName,
          human_feedback: ans.humanFeedback || null,
          corrected_stage: ans.correctedStage || null,
        }));

        const { error: ansErr } = await supabase
          .from('analyses')
          .upsert(analysesPayload);

        if (ansErr) {
          console.warn('[Supabase] Erro ao salvar análises da sessão:', ansErr.message);
        }
      }

      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao salvar sessão:', e);
      return false;
    }
  },

  // --- EXCLUSÃO DE IMAGENS E ANÁLISES ---
  async deleteAnalysis(analysisId: string): Promise<boolean> {
    try {
      // 1. Consultar metadados da análise para verificar se a imagem está no Storage
      const { data: targetAnalysis } = await supabase
        .from('analyses')
        .select('image_url')
        .eq('id', analysisId)
        .maybeSingle();

      if (targetAnalysis && targetAnalysis.image_url) {
        // Se a imagem estiver armazenada no Supabase Storage, remover o arquivo do bucket
        if (targetAnalysis.image_url.includes('storage/v1/object/public/')) {
          try {
            const parts = targetAnalysis.image_url.split('storage/v1/object/public/')[1]?.split('/');
            if (parts && parts.length >= 2) {
              const bucketName = parts[0];
              const filePath = parts.slice(1).join('/');
              await supabase.storage.from(bucketName).remove([filePath]);
            }
          } catch (stErr) {
            console.warn('[Supabase Storage] Erro ao remover arquivo de imagem do bucket:', stErr);
          }
        }
      }

      // 2. Deletar o registro permanentemente da tabela public.analyses no Supabase DB
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.warn('[Supabase] Erro ao deletar análise da tabela public.analyses:', error.message);
        return false;
      }

      console.log(`[Supabase DB] Análise ${analysisId} deletada do banco de dados com sucesso.`);
      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao deletar análise:', e);
      return false;
    }
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('roast_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.warn('[Supabase] Erro ao deletar sessão:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao deletar sessão:', e);
      return false;
    }
  },

  // --- ALERTAS PREDITIVOS (PREDICTIVE ALERTS) ---
  async fetchAlerts(): Promise<PredictiveAlert[] | null> {
    try {
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error || !data) {
        if (error) console.warn('[Supabase] Erro ao buscar alertas:', error.message);
        return null;
      }

      return data.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        ovenId: item.oven_id,
        severity: item.severity,
        title: item.title,
        message: item.message,
        read: item.read ?? false,
        type: item.type,
      }));
    } catch (e) {
      console.warn('[Supabase] Exceção ao consultar alertas:', e);
      return null;
    }
  },

  async addAlert(alert: PredictiveAlert): Promise<boolean> {
    try {
      const payload = {
        id: alert.id,
        timestamp: alert.timestamp,
        oven_id: alert.ovenId,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        read: alert.read,
        type: alert.type,
      };

      const { error } = await supabase.from('predictive_alerts').upsert(payload);
      if (error) {
        console.warn('[Supabase] Erro ao adicionar alerta:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exceção ao adicionar alerta:', e);
      return false;
    }
  },

  // --- USUÁRIOS E AUTENTICAÇÃO VIA BANCO DE DADOS (USERS / ADMIN AUTH) ---
  async fetchUsers(): Promise<User[] | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error || !data) {
        if (error) console.warn('[Supabase] Erro ao buscar usuários:', error.message);
        return null;
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        shift: item.shift || undefined,
        avatar: item.avatar || undefined,
        password: item.password || undefined,
      }));
    } catch (e) {
      console.warn('[Supabase] Exceção ao buscar usuários:', e);
      return null;
    }
  },

  /**
   * Verifica se o usuário existe estritamente na tabela `public.users` do Supabase DB.
   * Não permite autenticação se o registro não constar na tabela do banco.
   */
  async getUserFromDb(userIdentifier: string): Promise<User | null> {
    try {
      const cleanInput = userIdentifier.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error || !data || data.length === 0) {
        return null;
      }

      const found = data.find(u => {
        const cleanName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanId = u.id.toLowerCase();
        return u.id === userIdentifier || cleanId === cleanInput || cleanName === cleanInput || cleanName.includes(cleanInput);
      });

      if (!found) return null;

      return {
        id: found.id,
        name: found.name,
        role: found.role,
        shift: found.shift || undefined,
        avatar: found.avatar || undefined,
        password: found.password || undefined,
      };
    } catch (e) {
      console.warn('[Supabase] Exceção ao verificar usuário no banco de dados:', e);
      return null;
    }
  },

  /**
   * Autentica especificamente administradores na tabela `public.users`.
   */
  async authenticateAdmin(usernameOrId: string, password?: string): Promise<User | null> {
    try {
      const cleanInput = usernameOrId.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

      if (error || !data) {
        console.warn('[Supabase] Erro ao consultar tabela de administradores:', error?.message);
        return null;
      }

      const found = data.find(u => {
        const cleanName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanId = u.id.toLowerCase();
        return u.id === usernameOrId || cleanId === cleanInput || cleanName.includes(cleanInput) || cleanInput === 'fabio' || cleanInput === 'admin';
      });

      if (!found) return null;

      // Verificar senha no Supabase (se fornecida e cadastrada)
      const expectedPassword = found.password || '123';
      if (password !== expectedPassword) {
        return null;
      }

      return {
        id: found.id,
        name: found.name,
        role: found.role,
        shift: found.shift || undefined,
        avatar: found.avatar || undefined,
      };
    } catch (e) {
      console.warn('[Supabase] Exceção na autenticação de administrador:', e);
      return null;
    }
  },

  /**
   * Autentica especificamente operadores na tabela `public.users`.
   */
  async authenticateOperator(operatorIdOrName: string): Promise<User | null> {
    const user = await this.getUserFromDb(operatorIdOrName);
    if (user && user.role === 'operator') {
      return user;
    }
    return null;
  },

  /**
   * Valida se um usuário autenticado via Supabase Auth possui registro autorizado na tabela `public.users`.
   * Caso contrário, sinaliza que a sessão deve ser encerrada.
   */
  async validateAuthUserWithDb(authUserId: string, authUserEmail?: string): Promise<User | null> {
    try {
      const { data: userById } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (userById) {
        return {
          id: userById.id,
          name: userById.name,
          role: userById.role,
          shift: userById.shift || undefined,
          avatar: userById.avatar || undefined,
        };
      }

      if (authUserEmail) {
        const { data: allUsers } = await supabase.from('users').select('*');
        if (allUsers) {
          const match = allUsers.find(u => 
            u.id.toLowerCase() === authUserEmail.toLowerCase() || 
            u.name.toLowerCase() === authUserEmail.split('@')[0].toLowerCase()
          );
          if (match) {
            return {
              id: match.id,
              name: match.name,
              role: match.role,
              shift: match.shift || undefined,
              avatar: match.avatar || undefined,
            };
          }
        }
      }

      // Se não encontrou na tabela `users` do banco, o usuário não é autorizado!
      return null;
    } catch (e) {
      console.warn('[Supabase] Exceção ao validar usuário do Auth com a tabela do DB:', e);
      return null;
    }
  },

  /**
   * Rotina de verificação e limpeza de imagens no Supabase Storage.
   * Compara os arquivos nos buckets com as URLs cadastradas na tabela `analyses`.
   * Deleta somente arquivos no Storage que não possuem nenhuma referência no banco.
   */
  async cleanupUnreferencedStorageImages(): Promise<{ removedFiles: string[], totalInspected: number }> {
    const removedFiles: string[] = [];
    let totalInspected = 0;

    try {
      // 1. Obter todas as URLs de imagem válidas cadastradas no banco de dados
      const { data: analyses, error: aErr } = await supabase
        .from('analyses')
        .select('image_url');

      if (aErr || !analyses) {
        console.warn('[Supabase Storage Cleanup] Erro ao buscar análises do banco:', aErr?.message);
        return { removedFiles, totalInspected };
      }

      const validUrls = new Set(analyses.map(a => a.image_url));

      // 2. Listar todos os buckets do Supabase Storage
      const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
      if (bErr || !buckets || buckets.length === 0) {
        console.log('[Supabase Storage Cleanup] Nenhum bucket encontrado no Storage.');
        return { removedFiles, totalInspected };
      }

      // 3. Para cada bucket, verificar todos os arquivos
      for (const bucket of buckets) {
        const { data: files, error: fErr } = await supabase.storage.from(bucket.name).list();
        if (fErr || !files) continue;

        for (const file of files) {
          totalInspected++;
          const publicUrl = supabase.storage.from(bucket.name).getPublicUrl(file.name).data.publicUrl;
          
          // Se a URL pública ou o nome do arquivo não estiver em nenhuma análise válida
          const isReferenced = Array.from(validUrls).some(url => url.includes(file.name) || url === publicUrl);
          
          if (!isReferenced) {
            const { error: delErr } = await supabase.storage.from(bucket.name).remove([file.name]);
            if (!delErr) {
              console.log(`[Supabase Storage Cleanup] Imagem sem referência removida: ${bucket.name}/${file.name}`);
              removedFiles.push(`${bucket.name}/${file.name}`);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Supabase Storage Cleanup] Exceção durante limpeza de imagens:', e);
    }

    return { removedFiles, totalInspected };
  },

  async seedInitialDataIfEmpty(users: User[], ovens: OvenConfig[]): Promise<void> {
    try {
      // 1. Tentar salvar usuários iniciais se a tabela estiver pronta
      const existingUsers = await this.fetchUsers();
      if (existingUsers && existingUsers.length === 0) {
        await supabase.from('users').upsert(
          users.map(u => ({ id: u.id, name: u.name, role: u.role, shift: u.shift || null, password: u.password || '123' }))
        );
      }

      // 2. Tentar salvar fornos iniciais se vazio
      const existingOvens = await this.fetchOvens();
      if (existingOvens && existingOvens.length === 0) {
        await this.upsertOvens(ovens);
      }
    } catch (e) {
      console.warn('[Supabase] Seed ignorado devido a indisponibilidade temporária do schema:', e);
    }
  }
};

