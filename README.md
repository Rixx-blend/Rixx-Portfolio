# Rixx — Portfolio

Next.js 14 · Tailwind · Framer Motion · Lenis · React Three Fiber · espace admin protégé par code.

## Mettre en ligne (GitHub + Vercel)

1. Crée un dépôt GitHub et pousse ce dossier :
   ```bash
   git init && git add . && git commit -m "Portfolio Rixx"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/rixx.git
   git push -u origin main
   ```
2. Sur vercel.com : **Add New → Project**, importe le dépôt, puis **Deploy**.
3. Dans le projet Vercel, onglet **Storage**, ajoute :
   - **Upstash Redis** (stocke tes créations, services, réseaux…)
   - **Blob** (stocke tes images et fichiers .glb)
4. **Settings → Environment Variables** : ajoute `ADMIN_CODE` avec le code de ton choix.
5. **Deployments → Redeploy** pour que tout soit pris en compte.

Ensuite : va sur `ton-site.vercel.app/admin` (ou clique sur le petit « Admin » en bas du site), entre ton code, modifie, puis **Enregistrer**.

## En local

```bash
npm install
cp .env.example .env.local   # mets ADMIN_CODE
npm run dev
```
Sans Redis/Blob, les données sont écrites dans `data/db.json` et les fichiers dans `public/uploads`.

## Ce que tu peux modifier dans l'admin

Accueil (nom, texte, PDP, outils + logos) · Catégories · Créations par catégorie · PDP · Modèles 3D (.glb) · Réseaux (dock) · Contact (titre, lien Discord).
Glisse la poignée ⋮⋮ pour réordonner, l'étoile ★ met un élément en premier.

## Conseils pour les .glb

Export Blender : format glTF binaire (.glb), compression Draco, textures 2K max. Limite d'upload : 100 Mo.

## Structure

- `app/` pages et routes API (`/api/data`, `/api/auth`, `/api/upload`)
- `components/` site public, `components/admin/` espace admin, `components/ui/animated-dock.tsx` dock
- `lib/` données par défaut, stockage, authentification
