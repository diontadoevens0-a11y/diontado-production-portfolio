import {Download, Film, ImagePlus, Sparkles} from 'lucide-react';
import {useEffect, useState} from 'react';

type VideoAspectRatio = '16:9' | '9:16';

const MOTION_PRESETS = [
  'Mouvement de caméra cinéma lent avec lumière dorée subtile et brise naturelle.',
  'Travelling avant fluide mettant en valeur les textures et la profondeur de champ.',
  'Effet portrait cinématographique : léger frémissement des étoffes et reflets chauds.',
];

export function VideoAnimatorPanel() {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [motionPrompt, setMotionPrompt] = useState<string>(MOTION_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [generatedMimeType, setGeneratedMimeType] = useState<string>('video/mp4');

  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrorMessage('Format non pris en charge. Choisissez une image PNG, JPEG ou WebP.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image trop volumineuse (15 Mo maximum). Compressez ou redimensionnez votre photo.');
      return;
    }
    setErrorMessage(null);
    setImageMimeType(file.type);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUrl) {
      setErrorMessage('Veuillez d’abord importer une photographie.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl('');

    try {
      const response = await fetch('/api/video/animate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: imageMimeType,
          prompt: motionPrompt,
          aspectRatio,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        videoBase64?: string;
        videoUri?: string;
        mimeType?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la génération vidéo.');
      }

      const outMime = data.mimeType || 'video/mp4';
      setGeneratedMimeType(outMime);

      if (data.videoBase64) {
        const binary = window.atob(data.videoBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], {type: outMime});
        setVideoUrl(URL.createObjectURL(blob));
      } else if (data.videoUri) {
        setVideoUrl(data.videoUri);
      } else {
        throw new Error('Aucune vidéo exploitable n’a été reçue.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erreur lors de la génération vidéo.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-14 rounded-2xl border border-white/12 bg-[#121217] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
            Atelier Cinéma · Animation d’image
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-white">
            Animer une photo en séquence vidéo
          </h3>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-stone-400">
          Importez une photographie de séance et générez une animation cinématographique au format paysage (16:9) ou portrait (9:16).
        </p>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label
              htmlFor="animatePhotoInput"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
            >
              1. Photographie source (PNG, JPEG ou WebP)
            </label>
            <label
              htmlFor="animatePhotoInput"
              className="mt-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-white/20 bg-[#09090B] px-4 py-4 transition-colors hover:border-[#D4AF6A]"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4AF6A]/40 bg-[#D4AF6A]/10 text-[#E7CA91]">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-white">
                    {imageFileName || 'Choisir une photographie depuis votre appareil'}
                  </p>
                  <p className="text-xs text-stone-400">
                    Cliquer pour sélectionner un fichier image
                  </p>
                </div>
              </div>
              <input
                id="animatePhotoInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
              2. Format de sortie
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(['16:9', '9:16'] as VideoAspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors ${
                    aspectRatio === ratio
                      ? 'border-[#D4AF6A] bg-[#D4AF6A] text-[#0B0A09]'
                      : 'border-white/15 bg-[#09090B] text-stone-300 hover:border-[#D4AF6A]/65 hover:text-white'
                  }`}
                >
                  <Film className="h-4 w-4" aria-hidden="true" />
                  <span>{ratio === '16:9' ? '16:9 · Paysage' : '9:16 · Portrait'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="animateMotionPrompt"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
            >
              3. Direction du mouvement
            </label>
            <textarea
              id="animateMotionPrompt"
              rows={3}
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-[#09090B] p-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MOTION_PRESETS.map((preset, idx) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMotionPrompt(preset)}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-stone-300 hover:border-[#D4AF6A]/60 hover:text-[#E7CA91]"
                >
                  Style {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-200"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating || !imageDataUrl}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] transition-colors hover:bg-[#E7CA91] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>
              {isGenerating
                ? 'Génération vidéo en cours (patientez)...'
                : 'Animer la photo en vidéo'}
            </span>
          </button>
        </form>

        {/* Aperçu image source & vidéo générée */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#09090B] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400">
              {videoUrl ? `Résultat vidéo (${aspectRatio})` : 'Aperçu'}
            </span>
            {videoUrl && (
              <a
                href={videoUrl}
                download={`diontado-animation-${aspectRatio.replace(':', 'x')}.mp4`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7CA91] hover:underline"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Télécharger</span>
              </a>
            )}
          </div>

          <div className="mt-4 flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#0D0D12]">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className={`max-h-[420px] w-full rounded-lg object-contain ${
                  aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[240px]' : 'aspect-video'
                }`}
              />
            ) : imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt="Photographie importée pour animation"
                className="max-h-[320px] w-auto rounded-lg object-contain"
              />
            ) : (
              <div className="px-6 py-10 text-center text-xs text-stone-500">
                Importez une photo pour la prévisualiser et générer une séquence vidéo animée.
              </div>
            )}
          </div>

          {generatedMimeType && videoUrl && (
            <p className="mt-3 font-mono text-[11px] text-stone-400">
              Piste générée · {generatedMimeType} · Format {aspectRatio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
