import 'dotenv/config';
import express from 'express';
import type {Request, Response} from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GoogleGenAI} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ALLOWED_ASPECT_RATIOS = new Set(['16:9', '9:16']);
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Clé GEMINI_API_KEY manquante dans la configuration serveur.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseApiError(err: unknown): {status: number; message: string} {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Erreur inconnue');
  const lower = rawMessage.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message:
        'Clé API Gemini invalide ou refusée. Vérifiez la clé sélectionnée dans Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Quota Gemini dépassé ou modèle payant requis. Sélectionnez une clé API facturée dans Settings > Secrets.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 404,
      message: 'Modèle Gemini introuvable ou indisponible : ' + rawMessage,
    };
  }
  if (lower.includes('gemini_api_key manquante')) {
    return {
      status: 500,
      message: rawMessage,
    };
  }
  return {
    status: 500,
    message: rawMessage,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({limit: '25mb'}));

  app.get('/api/disponibilites', (_req: Request, res: Response) => {
    const filePath = path.resolve(__dirname, 'github-pages/assets/data/disponibilites.json');
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        res.json({
          mis_a_jour: typeof parsed?.mis_a_jour === 'string' ? parsed.mis_a_jour : '',
          dates_indisponibles: Array.isArray(parsed?.dates_indisponibles)
            ? parsed.dates_indisponibles
            : [],
          jours_fermes_hebdo: Array.isArray(parsed?.jours_fermes_hebdo)
            ? parsed.jours_fermes_hebdo
            : [],
        });
        return;
      }
    } catch {
      // Fall back to empty availability list
    }
    res.json({
      mis_a_jour: '',
      dates_indisponibles: [],
      jours_fermes_hebdo: [],
    });
  });

  app.post('/api/video/animate', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        imageBase64?: string;
        mimeType?: string;
        prompt?: string;
        aspectRatio?: string;
      };

      const rawBase64 = typeof body?.imageBase64 === 'string' ? body.imageBase64.trim() : '';
      const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const mimeType = typeof body?.mimeType === 'string' ? body.mimeType.trim() : 'image/jpeg';
      const aspectRatio =
        typeof body?.aspectRatio === 'string' && ALLOWED_ASPECT_RATIOS.has(body.aspectRatio)
          ? (body.aspectRatio as '16:9' | '9:16')
          : '16:9';
      const prompt =
        typeof body?.prompt === 'string' && body.prompt.trim()
          ? body.prompt.trim()
          : 'Subtle cinematic camera push-in with gentle natural motion and warm studio lighting.';

      if (!cleanBase64) {
        res.status(400).json({error: 'Veuillez importer une image avant de générer la vidéo.'});
        return;
      }
      if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        res.status(400).json({
          error: 'Format d’image non pris en charge. Utilisez PNG, JPEG ou WebP.',
        });
        return;
      }

      const ai = getGeminiClient();
      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: [
            {
              type: 'image',
              mime_type: mimeType,
              data: cleanBase64,
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: aspectRatio,
          },
        },
        {timeout: 300000}
      );

      const outputVideo = interaction.output_video;
      if (outputVideo && outputVideo.data) {
        res.json({
          mimeType: outputVideo.mime_type || 'video/mp4',
          videoBase64: outputVideo.data,
          aspectRatio,
        });
        return;
      }

      if (outputVideo && outputVideo.uri) {
        res.json({
          mimeType: outputVideo.mime_type || 'video/mp4',
          videoUri: outputVideo.uri,
          aspectRatio,
        });
        return;
      }

      res.status(502).json({
        error: 'La génération vidéo est terminée mais aucune piste vidéo n’a été renvoyée.',
      });
    } catch (err) {
      const parsed = parseApiError(err);
      res.status(parsed.status).json({error: parsed.message});
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DIONTADO PRODUCTION server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
