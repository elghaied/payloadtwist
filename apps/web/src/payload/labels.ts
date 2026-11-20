// Admin labels for the demo in every interface language (i18n.supportedLanguages), so the Arabic
// right-to-left admin and the French admin aren't half English.
const t = (en: string, fr: string, ar: string) => ({ en, fr, ar })

export const L = {
  groups: {
    content: t('Content', 'Contenu', 'المحتوى'),
    showcase: t('Showcase', 'Vitrine', 'المعرض'),
    settings: t('Settings', 'Paramètres', 'الإعدادات'),
  },
  collections: {
    users: { singular: t('User', 'Utilisateur', 'مستخدم'), plural: t('Users', 'Utilisateurs', 'المستخدمون') },
    media: { singular: t('Media', 'Média', 'وسيط'), plural: t('Media', 'Médias', 'الوسائط') },
    categories: { singular: t('Category', 'Catégorie', 'تصنيف'), plural: t('Categories', 'Catégories', 'التصنيفات') },
    folders: { singular: t('Folder', 'Dossier', 'مجلد'), plural: t('Folders', 'Dossiers', 'المجلدات') },
    posts: { singular: t('Post', 'Article', 'مقالة'), plural: t('Posts', 'Articles', 'المقالات') },
    pages: { singular: t('Page', 'Page', 'صفحة'), plural: t('Pages', 'Pages', 'الصفحات') },
    fieldShowcase: { singular: t('Field showcase', 'Vitrine des champs', 'معرض الحقول'), plural: t('Field showcase', 'Vitrine des champs', 'معرض الحقول') },
  },
  siteSettings: t('Site settings', 'Paramètres du site', 'إعدادات الموقع'),
  editorialWidget: t('Editorial overview', 'Aperçu éditorial', 'نظرة تحريرية'),
  tabs: {
    content: t('Content', 'Contenu', 'المحتوى'),
    details: t('Details', 'Détails', 'التفاصيل'),
    seo: t('SEO', 'SEO', 'تحسين محركات البحث'),
    basics: t('Basics', 'Bases', 'الأساسيات'),
    choices: t('Choices', 'Choix', 'الخيارات'),
    datesData: t('Dates & data', 'Dates et données', 'التواريخ والبيانات'),
    relations: t('Relations', 'Relations', 'العلاقات'),
    layout: t('Layout fields', 'Champs de mise en page', 'حقول التخطيط'),
  },
}
