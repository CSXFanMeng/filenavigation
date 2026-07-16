# FileNavigation

[جميع اللغات](../../README.md) · [أحدث إصدار](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation هو تطبيق سطح مكتب مبني باستخدام Rust وTauri للبحث عن الملفات والمجلدات داخل مجلد محلي محدد. يتم البحث بالكامل على الجهاز ولا يتم رفع أسماء الملفات أو المسارات أو المحتوى.

## الميزات

- بحث محلي عن الملفات والمجلدات
- خلفية Rust/Tauri غير متزامنة بالكامل مع الإلغاء والتقدم المباشر
- تصفية النتائج وفرزها وعرضها تدريجيا
- واجهة حديثة متجاوبة بأيقونات Lucide وحالات تركيز سهلة الوصول
- نافذة بلا إطار بحدود يرسمها التطبيق وأزرار مترجمة
- مساحة عمل ثابتة وقائمة نتائج تمرر بشكل مستقل
- واجهة بـ20 لغة محفوظة في ملفات مستقلة
- التحقق من أحدث GitHub Release وعرض الملاحظات باللغة الحالية
- عرض بصمات حزم التثبيت للتحقق من سلامتها

## التنزيل

- Windows: `.exe` و`.msi`
- macOS: `.dmg` و`.app`
- Linux: `.deb` و`.rpm` و`.AppImage`

تتوفر الحزم في [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## التطوير والبناء

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

إذا منع PowerShell تشغيل `npm.ps1` فاستخدم `npm.cmd`. توجد ملفات البناء في `src-tauri/target/release/bundle/`.

## اللغات والتحديثات

توجد الترجمات في `src/i18n/locales`. يستخدم [RELEASE_NOTES.md](../../RELEASE_NOTES.md) كتل `<!-- lang:xx -->`. يبدأ فاحص التحديث باللغة الحالية ثم الإنجليزية ثم نص Release الكامل.

## الترخيص

يستخدم المشروع [FileNavigation Non-Commercial Source License](../../LICENSE.md). يحظر الاستخدام التجاري وإعادة البيع واستضافة SaaS والخدمات المدفوعة والتكامل التجاري المغلق والتوزيع ضمن منتجات تجارية.
