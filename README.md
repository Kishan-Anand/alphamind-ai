# AlphaMind AI

AlphaMind AI is a stock intelligence dashboard with Supabase email OTP
authentication, market charts and screening, a Groq-powered assistant, and a
FastAPI Random Forest stock-direction prediction backend.

## Configure the dashboard

Copy `.env.example` to `.env.local` and fill in the public Supabase URL/key,
Groq API key, and Finnhub API key. `NEXT_PUBLIC_ML_API_URL` defaults to the
local FastAPI backend and can be changed when deploying.

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env.local` or put service-role keys or API secrets in browser
code. `.env.local` is excluded from Git.

## AlphaMind ML backend

The stock-direction predictions use a Python Random Forest model trained on
approximately five years of Yahoo Finance daily data. Training uses the oldest
80% of feature rows and reports accuracy on the newest 20%; the saved model is
reused for later predictions. Confidence is the model's probability for its
predicted class, not a guarantee of future performance.

From PowerShell, install the backend dependencies if they are not already
available:

```powershell
cd C:\Users\Kishan\Desktop\stock-ai-dashboard\ml-backend
python -m pip install -r requirements.txt
```

Train and evaluate AAPL (the chronological test accuracy is included in the
output). This also saves `models\AAPL.joblib`:

```powershell
python ml_model.py train AAPL
```

Start the FastAPI backend:

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test the prediction endpoint at
[http://127.0.0.1:8000/predict/AAPL](http://127.0.0.1:8000/predict/AAPL).
The first request for another symbol trains and saves its model automatically.
The dashboard defaults to `http://localhost:8000`; deployments can set
`NEXT_PUBLIC_ML_API_URL` in the Next.js environment to point at the backend.
Start the existing dashboard from the project root with `npm run dev`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
