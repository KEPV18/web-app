# Video Analytics Pro - ملاحظات المطور

يقدم هذا المستند نظرة عامة فنية على تطبيق Video Analytics Pro، ويغطي بنية الكود، وتدفق البيانات، ونقاط التخصيص، والاقتراحات المستقبلية.

## بنية المشروع (Next.js)

```
video-analytics-pro/
├── public/             # الأصول الثابتة (مثل الأيقونات)
├── src/
│   ├── app/            # مسارات التطبيق (layout.tsx, page.tsx)
│   ├── components/     # مكونات React (Header, Timer, Counter, ProgressBars, Charts, OfficialDataEntry, ...)
│   ├── lib/            # الوحدات المساعدة (googleSheets.ts, targets.ts)
│   └── globals.css     # أنماط CSS العامة (Tailwind)
├── .env.local          # متغيرات البيئة المحلية (غير متضمنة في git)
├── next.config.mjs     # تكوين Next.js
├── package.json        # تبعيات المشروع والبرامج النصية
├── pnpm-lock.yaml      # ملف قفل Pnpm
├── tsconfig.json       # تكوين TypeScript
├── tailwind.config.ts  # تكوين Tailwind CSS
├── postcss.config.js   # تكوين PostCSS
├── README.md           # دليل المستخدم
└── DEVELOPER_NOTES.md  # هذا الملف
```

## تدفق البيانات

1.  **التحميل الأولي:**
    *   عند تحميل الصفحة (`src/app/page.tsx`)، يتم تشغيل `useEffect`.
    *   يتم تحميل الإعدادات (وضع الإجازة، الوضع الداكن) من `localStorage`.
    *   يتم استدعاء `loadSheetData` (`src/lib/googleSheets.ts`) لجلب البيانات من Google Sheet المحدد باستخدام مفتاح API.
    *   يتم تحليل البيانات المستلمة وتخزينها في حالة `sheetData`.
    *   يتم تحديد بيانات اليوم الحالي (`todayData`).
    *   يتم استعادة حالة الجلسة (الثواني ومقاطع الفيديو المسجلة) من `localStorage` إن وجدت، وإلا يتم استخدام بيانات اليوم من `sheetData` (فقط لمقاطع الفيديو).
    *   يتم طلب إذن الإشعارات المكتبية.
    *   يتم بدء فحص دوري للبيانات المعلقة للمزامنة (`pendingSync` في `localStorage`).
2.  **تتبع الوقت والفيديو:**
    *   مكون `Timer` (`src/components/Timer.tsx`) يتتبع الثواني المنقضية ويستدعي `onTimeUpdate` في `page.tsx`.
    *   مكون `Counter` (`src/components/Counter.tsx`) يعرض عدد مقاطع الفيديو. يمكن زيادته يدويًا أو تلقائيًا بناءً على `totalSeconds` والفاصل الزمني المحدد.
    *   يتم استدعاء `onVideoAdded` في `page.tsx` عند تغيير عدد مقاطع الفيديو.
    *   يتم حفظ `totalSeconds` و `videosLogged` باستمرار في `localStorage` لاستمرارية الجلسة.
3.  **حفظ التقدم (عند إيقاف المؤقت):**
    *   عند استدعاء `onTimerStop` في `page.tsx`:
    *   يتم حساب الساعات المسجلة.
    *   يتم تحديد رقم الصف لليوم الحالي في `sheetData`.
    *   يتم استدعاء `saveSheetData` لمحاولة حفظ `videosLogged` و `hoursLogged` في الأعمدة B و C للصف المقابل.
    *   **ملاحظة هامة:** يتطلب الحفظ مصادقة OAuth 2.0، والتي لم يتم تنفيذها بالكامل في هذا الإصدار. سيفشل الحفظ باستخدام مفتاح API فقط.
    *   إذا فشل الحفظ، يتم تخزين البيانات المراد حفظها في `localStorage` (`pendingSync`) لمحاولة المزامنة لاحقًا.
    *   يتم مسح `totalSeconds` و `videosLogged` من `localStorage`.
4.  **حفظ البيانات الرسمية:**
    *   مكون `OfficialDataEntry` (`src/components/OfficialDataEntry.tsx`) يسمح للمستخدم بإدخال `officialVideos` و `officialHours`.
    *   عند الإرسال، يتم استدعاء `saveSheetData` لمحاولة حفظ هذه القيم في الأعمدة K و L للصف المقابل.
    *   نفس قيود المصادقة OAuth 2.0 تنطبق هنا.
    *   يتم استدعاء `onDataSaved` في `page.tsx` لتحديث الحالة المحلية (`sheetData`, `todayData`) بشكل متفائل.
5.  **الحسابات المشتقة:**
    *   يتم حساب الأهداف (`targets`) باستخدام `useMemo` و `calculateTargets` بناءً على `isVacationMode`.
    *   يتم حساب التقدم الحالي (`currentProgress` - اليومي، الأسبوعي، الشهري) باستخدام `useMemo` بناءً على `sheetData`, `videosLogged`, `totalSeconds`.
6.  **العرض:**
    *   `ProgressBars` يعرض `currentProgress` مقابل `targets`.
    *   `Charts` يعرض بيانات `sheetData` للأسبوع الحالي.

## نقاط التخصيص

*   **Google Sheets API & Spreadsheet:**
    *   قم بتحديث متغيرات البيئة في `.env.local` (أو متغيرات بيئة النشر) بـ `NEXT_PUBLIC_GOOGLE_API_KEY`, `NEXT_PUBLIC_SPREADSHEET_ID`, `NEXT_PUBLIC_SHEET_NAME`.
    *   نطاق قراءة البيانات (`A1:L32`) في `page.tsx` قد يحتاج إلى تعديل إذا كان لديك أكثر من 31 يومًا أو بنية مختلفة.
*   **الأهداف الافتراضية:**
    *   يمكن تعديل الثوابت `DAILY_VIDEO_TARGET` و `DAILY_HOUR_TARGET` في `src/lib/targets.ts`.
*   **أيام العمل:**
    *   يمكن تعديل أيام العمل الافتراضية (الأحد-الجمعة) في `calculateWorkingDaysInMonth` داخل `src/lib/targets.ts`.
*   **تصميم الواجهة (Tailwind CSS & shadcn/ui):**
    *   يمكن تعديل الأنماط في `src/globals.css`.
    *   يمكن تخصيص مكونات shadcn/ui وفقًا لوثائقها.
    *   يمكن تعديل الألوان والخطوط في `tailwind.config.ts`.
*   **فواصل العد التلقائي:**
    *   يمكن تعديل الخيارات (10، 15، 20 ثانية) في مكون `Counter`.
*   **منطق المزامنة:**
    *   يمكن تعديل الفاصل الزمني لفحص `pendingSync` في `useEffect` داخل `page.tsx`.

## اقتراحات التحسين المستقبلية

*   **تنفيذ مصادقة OAuth 2.0:** هذا هو التحسين الأكثر أهمية لتمكين **الكتابة** بشكل موثوق إلى Google Sheets. سيتطلب ذلك استخدام مكتبات مثل Google Identity Services (GSI) أو مكتبات OAuth 2.0 أخرى لإدارة تدفق تسجيل الدخول والحصول على رموز الوصول.
*   **مكون الإعدادات:**
    *   إنشاء مكون `Settings` للسماح للمستخدم بتكوين مفتاح API ومعرف جدول البيانات واسم الورقة مباشرة من الواجهة بدلاً من متغيرات البيئة.
    *   السماح للمستخدم بتخصيص الأهداف اليومية.
    *   إضافة خيار لتحديد أيام العمل الأسبوعية.
*   **تصدير التقارير (CSV):**
    *   تنفيذ وظائف الأزرار المعطلة حاليًا في `OfficialDataEntry` لتصدير البيانات اليومية أو الأسبوعية أو الشهرية كملف CSV.
*   **مزامنة أكثر قوة:**
    *   تحسين معالجة `pendingSync` للتعامل مع حالات فشل متعددة أو تعارضات محتملة إذا تم تحرير الورقة يدويًا.
    *   إضافة زر مزامنة يدوي في وضع التصحيح.
*   **وضع التصحيح (Debug Mode):**
    *   تنفيذ قسم "Debug Mode" المقترح في `page.tsx` لعرض بيانات Google Sheet الأولية، وحالة المزامنة، وعداد محاولات المزامنة، وزر المزامنة اليدوي.
*   **التحقق من صحة البيانات:**
    *   إضافة تحقق أكثر صرامة من صحة التواريخ والأرقام عند تحميل البيانات من Google Sheet.
    *   اكتشاف التناقضات بين البيانات المحلية وبيانات الورقة وتقديم خيارات للمستخدم لحلها.
*   **اختبار شامل:**
    *   كتابة اختبارات الوحدة واختبارات التكامل لضمان استقرار الوظائف الأساسية.
*   **تحسينات الواجهة:**
    *   تحسين مؤشرات التحميل وحالات الخطأ.
    *   إضافة انتقالات أو رسوم متحركة لتحسين تجربة المستخدم.
    *   ضمان تحديث المخططات ديناميكيًا عند تغيير الوضع الداكن/الفاتح (قد يتطلب إعادة تحميل أو إعادة تهيئة).

## الاعتماديات الرئيسية

*   **Next.js:** إطار عمل React للتطبيقات.
*   **React:** مكتبة واجهة المستخدم.
*   **TypeScript:** للتحقق من الأنواع.
*   **Tailwind CSS:** إطار عمل CSS.
*   **shadcn/ui:** مجموعة مكونات واجهة مستخدم مبنية على Radix UI و Tailwind CSS.
*   **Chart.js & react-chartjs-2:** لإنشاء المخططات.
*   **react-hot-toast:** لعرض إشعارات التوست.
*   **date-fns (Implicit via react-day-picker):** لمعالجة التواريخ (إذا تم استخدام react-day-picker لاحقًا).

