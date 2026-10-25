# מערכת כרטיסיות לסדנאות

Next.js 15 · Auth.js · Neon Postgres · Vercel

## פריסה (10 דקות)

1. **GitHub** — צור repo חדש והעלה את תוכן התיקייה.
2. **Vercel** — Add New → Project → בחר את ה-repo → Deploy (ייכשל בפעם הראשונה, זה תקין).
3. **Neon** — בפרויקט ב-Vercel: Storage → Create Database → Neon → Connect.
   `DATABASE_URL` נוסף אוטומטית.
4. **משתני סביבה** — Settings → Environment Variables:
   - `AUTH_SECRET` — מחרוזת אקראית ארוכה (`openssl rand -base64 32`)
   - `SETUP_TOKEN` — מחרוזת אקראית נוספת
5. **טבלאות** — Storage → Neon → Open in Neon → SQL Editor → הדבק את `schema.sql` → Run.
6. **Redeploy** — Deployments → ⋮ → Redeploy.
7. **מנהל ראשון** — פתח `https://<הדומיין>/setup?token=<SETUP_TOKEN>` וצור מנהל.
   אחרי שנוצר, הדף נסגר לצמיתות. אפשר למחוק את `SETUP_TOKEN`.

## אחרי הכניסה

הגדרות → העלאת לוגו (הצבעים נחלצים אוטומטית) → סוגי סדנאות → תבניות כרטיסיות → טלפונים.
הורים → הוספת הורה עם סיסמה זמנית ושליחתה אליו.

## ביט

אין לביט קישור ציבורי עם סכום ממולא. הכפתור מעתיק את הסכום ומציג את המספר.
אם יש לך קישור תשלום של ביט — הדבק אותו בהגדרות ("קישור לפתיחת ביט") והכפתור גם יפתח אותו.

## פיתוח מקומי

```
cp .env.example .env.local   # מלא ערכים
npm i && npm run dev
```
