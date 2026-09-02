'use strict';

// ── i18n ─────────────────────────────────────────────────────────────

let _lang = localStorage.getItem('skoluboard_lang') || 'en';

const I18N = {
  en: {
    // Navigation
    nav_overview:        'Overview',
    nav_settings:        'Settings',
    nav_users:           'Users',
    nav_activity:        'Activity log',
    nav_export:          'Export',
    nav_content:         'Content',
    nav_groups:          'Groups',
    nav_system:          'System',
    nav_add_group:       'Add group',
    // Page subtitles
    sub_overview:        'Media content groups',
    sub_settings:        'Player parameters',
    sub_export:          'Data backup',
    sub_users:           'Access management',
    sub_activity:        'User action history',
    // Sections
    sect_display:        'Display',
    sect_bell_schedule:  'Bell schedule',
    sect_shortened_day:  'Shortened day',
    sect_export_import:  'Export / Import',
    sect_lesson_schedule:'Lesson schedule',
    sect_working_weekends:'Working weekend / holiday dates',
    // Tabs
    tab_regular:         'Regular',
    tab_shortened:       'Shortened',
    // Buttons
    btn_save_settings:   '💾 Save settings',
    btn_add_group:       '＋ Add group',
    btn_add_user:        '+ Add user',
    btn_add_lesson:      '+ Add lesson',
    btn_add_date:        '+ Add date',
    btn_export:          '💾 Export',
    btn_preview:         '👁 Preview',
    btn_refresh:         '↻ Refresh',
    btn_back:            '← Back',
    btn_rename:          '✏️ Edit',
    btn_delete_group:    '🗑️ Delete group',
    btn_test_access:     '🔗 Test access',
    btn_add_item:        '➕ Add',
    btn_load_more:       'Load more',
    btn_cancel:          'Cancel',
    btn_save:            'Save',
    btn_create:          'Create',
    btn_delete:          'Delete',
    btn_close:           'Close',
    btn_player:          '📺 Player',
    btn_pwd_hdr:         '🔑 Password',
    btn_logout:          'Log out',
    btn_pwd_user:        '🔑 Password',
    // Modals
    modal_add_group:     'Add group',
    modal_edit_group:    'Edit group',
    modal_add_item:      'Add item',
    modal_edit_item:     'Edit item',
    modal_add_user:      'Add user',
    modal_change_password: 'Change password',
    modal_confirm_delete:  'Confirm deletion',
    modal_preview:       'Preview',
    modal_new_group:     'New group',
    // Form labels – common
    lbl_title:           'Title',
    lbl_description:     'Description (optional)',
    lbl_display_mode:    'Display mode',
    lbl_show_on_screen:  'Show on screen',
    lbl_username:        'Username',
    lbl_password:        'Password',
    // Form labels – settings
    lbl_default_duration:'Default duration',
    lbl_transition_dur:  'Transition duration',
    lbl_progress_bar:    'Progress bar',
    lbl_progress_desc:   'At the bottom of the screen',
    lbl_counter:         'Slide counter',
    lbl_counter_desc:    '"1 / N" in the corner',
    lbl_autoadvance:     'Auto-advance',
    lbl_autoadvance_desc:'By timer',
    lbl_short_manual:    'Enable manually',
    lbl_short_manual_desc:'Active until disabled',
    lbl_short_dates:     'Scheduled shortened-day dates',
    lbl_working_weekends_desc: 'Dates that fall on weekends (or public holidays) but have lessons — the current-lesson indicator will be shown on these days.',
    // Form labels – add item
    lbl_type:            'Type',
    lbl_file:            'File',
    lbl_yt_link:         'YouTube link',
    lbl_sheets_url:      'Google Sheets URL',
    lbl_date_col:        'Date column',
    lbl_date_col_hint:   "Name or number (1-based) of the column containing the date. When set, only today's rows are shown on screen.",
    lbl_switch_end:      'Switch when video ends',
    lbl_slide_title:     'Slide title',
    // Form labels – group modal
    lbl_group_name:      'Group name',
    lbl_slide_dur:       'Slide display duration',
    lbl_slide_dur_hint:  'Empty — uses the global value from Settings',
    lbl_group_active:    'Group active (shown on screen)',
    // Form labels – change password
    lbl_current_password:'Current password',
    lbl_new_password:    'New password',
    lbl_repeat_password: 'Repeat new password',
    lbl_user:            'User',
    lbl_new_pwd_modal:   'New password',
    // Table headers
    th_username:         'Username',
    th_created:          'Created',
    th_actions:          'Actions',
    th_time:             'Time',
    th_user:             'User',
    th_action:           'Action',
    th_object:           'Object',
    th_lesson_num:       'Lesson #',
    th_start:            'Start',
    th_end:              'End',
    // Card & section titles
    card_player_iface:   'Player interface',
    card_reg_users:      'Registered users',
    lbl_preview_card:    'Preview 16:9',
    lbl_group_items:     'Group items',
    lbl_drag_reorder:    'Drag to reorder',
    // Stats
    stat_groups:         'Groups',
    stat_items:          'Items',
    stat_active:         'Active',
    stat_disabled:       'Disabled',
    // Badges & inline labels
    badge_active:        '● Active',
    badge_disabled:      '○ Disabled',
    badge_off:           '○ Off',
    hint_you:            '(you)',
    hint_items:          'item(s)',
    // Display modes
    mode_blur:           '🌫️ Blur',
    mode_cover:          '⬛ Cover',
    mode_contain:        '⬜ Contain',
    // Media types
    type_image:          'Image',
    type_video:          'Video',
    // Empty states
    empty_group:         'Group is empty',
    empty_group_hint:    'Add items using the form on the left',
    empty_no_lessons:    'No lessons',
    empty_no_dates:      'No scheduled dates',
    empty_no_records:    'No records',
    // Placeholders & hints
    hint_select_file:    'Select a file or enter a URL',
    hint_img_files:      'JPG, PNG, WebP · Multiple files allowed',
    hint_vid_files:      'MP4, WebM · Multiple files allowed',
    hint_new_group:      'New group',
    // Export
    export_desc:         'Exports the list of groups, items, and settings as JSON. Media files are not included — they are stored in the uploads/ folder on the server.',
    btn_import:          '📥 Import',
    btn_import_ok:       'Import & replace',
    btn_restore:         'Restore',
    btn_save_snapshot:   '💾 Save snapshot',
    sect_snapshots:      'Configuration snapshots',
    snapshots_desc:      'A snapshot stores the full set of groups, items and settings. One is taken automatically before every import or rollback.',
    snap_label_ph:       'Optional label',
    snap_empty:          'No snapshots yet',
    snap_label_col:      'Label',
    snap_contents:       'Contents',
    confirm_restore:     'Roll back to this snapshot? Current groups, items and settings will be replaced. A snapshot of the current state is taken first.',
    confirm_delete_snapshot: 'Delete this snapshot?',
    confirm_import:      'Import this file? All current groups, items and settings will be replaced. A snapshot of the current state is taken first.',
    t_snapshot_saved:   'Snapshot saved',
    t_snapshot_deleted: 'Snapshot deleted',
    t_restored:         'Configuration restored',
    t_imported:         (g, i) => `Imported ${g} group(s), ${i} item(s)`,
    e_bad_json:         'Not a valid JSON file',
    // Activity action & type labels
    act_login:           'Login',
    act_login_failed:    'Failed login',
    act_create:          'Create',
    act_update:          'Update',
    act_delete:          'Delete',
    type_group:          'Group',
    type_item:           'Item',
    type_settings:       'Settings',
    type_user:           'User',
    // Toast messages
    t_item_added:        'Item added',
    t_item_disabled:     'Item disabled',
    t_item_enabled:      'Item enabled',
    t_item_deleted:      'Item deleted',
    t_order_updated:     'Order updated',
    t_group_order:       'Group order updated',
    t_group_updated:     'Group updated',
    t_group_created:     'Group created',
    t_group_deleted:     'Group deleted',
    t_settings_saved:    'Settings saved',
    t_changes_saved:     'Changes saved',
    t_user_created:      'User created',
    t_user_deleted:      'User deleted',
    t_pwd_changed:       'Password changed',
    t_file_downloaded:   'File downloaded',
    // Error messages
    e_enter_title:       'Enter a title',
    e_enter_group_name:  'Enter a group name',
    e_fill_fields:       'Fill in all fields',
    e_enter_pwd:         'Enter the new password',
    e_date_format:       'Date format: DD.MM.YYYY',
    e_select_file:       'Select a file',
    e_enter_url:         'Enter the spreadsheet URL',
    e_yt_parse:          'Could not parse YouTube link',
    e_pwd_mismatch:      'New passwords do not match',
    e_pwd_min:           'Minimum 8 characters',
    e_enter_url_test:    'Enter a URL before testing',
    // Confirm messages (functions)
    confirm_delete_group:(name, n) => `Delete group "${name}" and all ${n} items in it? This action cannot be undone.`,
    confirm_delete_item: (name) => `Delete "${name}"? This action cannot be undone.`,
    confirm_delete_user: (name) => `Delete user "${name}"?`,
    confirm_ok_delete:   'Delete',
    confirm_ok_del_grp:  'Delete group',
    // Upload & misc status
    uploading:           '⏳ uploading…',
    uploaded:            '✔ uploaded',
    upload_error:        '✖ error',
    checking:            'Checking…',
    uploading_item:      (n, total) => total > 1 ? `Uploading ${n} / ${total}…` : 'Uploading…',
    uploaded_items:      (n, total) => n === total ? (n > 1 ? `Uploaded ${n} files` : 'Item added') : `Uploaded ${n} of ${total}`,
    // Schedule designer
    sd_content:          'Content',
    sd_rows_per_slide:   'Rows per slide',
    sd_logo:             'Logo',
    sd_heading:          'Slide heading',
    sd_school:           'School name',
    sd_appearance:       'Appearance',
    sd_background:       'Background',
    sd_bg_type:          'Type',
    sd_gradient:         'Gradient',
    sd_solid:            'Solid',
    sd_image:            'Image',
    sd_colour1:          'Colour 1',
    sd_colour2:          'Colour 2',
    sd_bg_colour:        'Background colour',
    sd_bg_image:         'Background image',
    sd_fit_mode:         'Fit mode',
    sd_cover:            'Cover',
    sd_contain:          'Contain',
    sd_typography:       'Typography',
    sd_font_table:       'Font (table)',
    sd_font_header:      'Header font',
    sd_text_colour:      'Text colour',
    sd_text_hint:        'Applies to the heading, clock, date, and table row text',
    sd_table:            'Table',
    sd_glassmorphism:    'Glassmorphism',
    sd_deco:             'Decorative pattern',
    sd_same_as_table:    'Same as table',
    sd_font_noto:        'Noto Sans (recommended, Latvian)',
    sd_display_lang:     'Display language',
    sd_lang_en:          'English',
    sd_lang_lv:          'Latvian',
  },
  lv: {
    // Navigation
    nav_overview:        'Pārskats',
    nav_settings:        'Iestatījumi',
    nav_users:           'Lietotāji',
    nav_activity:        'Aktivitātes žurnāls',
    nav_export:          'Eksports',
    nav_content:         'Saturs',
    nav_groups:          'Grupas',
    nav_system:          'Sistēma',
    nav_add_group:       'Pievienot grupu',
    // Page subtitles
    sub_overview:        'Multivides satura grupas',
    sub_settings:        'Atskaņotāja parametri',
    sub_export:          'Datu dublēšana',
    sub_users:           'Piekļuves pārvaldība',
    sub_activity:        'Lietotāju darbību vēsture',
    // Sections
    sect_display:        'Attēlojums',
    sect_bell_schedule:  'Zvanu saraksts',
    sect_shortened_day:  'Saīsinātā diena',
    sect_export_import:  'Eksports / imports',
    sect_lesson_schedule:'Stundu saraksts',
    sect_working_weekends:'Darba brīvdienu / svētku datumi',
    // Tabs
    tab_regular:         'Parasts',
    tab_shortened:       'Saīsināts',
    // Buttons
    btn_save_settings:   '💾 Saglabāt iestatījumus',
    btn_add_group:       '＋ Pievienot grupu',
    btn_add_user:        '+ Pievienot lietotāju',
    btn_add_lesson:      '+ Pievienot stundu',
    btn_add_date:        '+ Pievienot datumu',
    btn_export:          '💾 Eksportēt',
    btn_preview:         '👁 Priekšskatīt',
    btn_refresh:         '↻ Atjaunot',
    btn_back:            '← Atpakaļ',
    btn_rename:          '✏️ Rediģēt',
    btn_delete_group:    '🗑️ Dzēst grupu',
    btn_test_access:     '🔗 Pārbaudīt piekļuvi',
    btn_add_item:        '➕ Pievienot',
    btn_load_more:       'Ielādēt vairāk',
    btn_cancel:          'Atcelt',
    btn_save:            'Saglabāt',
    btn_create:          'Izveidot',
    btn_delete:          'Dzēst',
    btn_close:           'Aizvērt',
    btn_player:          '📺 Atskaņotājs',
    btn_pwd_hdr:         '🔑 Parole',
    btn_logout:          'Iziet',
    btn_pwd_user:        '🔑 Parole',
    // Modals
    modal_add_group:     'Pievienot grupu',
    modal_edit_group:    'Rediģēt grupu',
    modal_add_item:      'Pievienot materiālu',
    modal_edit_item:     'Rediģēt materiālu',
    modal_add_user:      'Pievienot lietotāju',
    modal_change_password: 'Mainīt paroli',
    modal_confirm_delete:  'Apstiprināt dzēšanu',
    modal_preview:       'Priekšskatījums',
    modal_new_group:     'Jauna grupa',
    // Form labels – common
    lbl_title:           'Nosaukums',
    lbl_description:     'Apraksts (neobligāts)',
    lbl_display_mode:    'Attēlošanas režīms',
    lbl_show_on_screen:  'Rādīt ekrānā',
    lbl_username:        'Lietotājvārds',
    lbl_password:        'Parole',
    // Form labels – settings
    lbl_default_duration:'Noklusētais ilgums',
    lbl_transition_dur:  'Pārejas ilgums',
    lbl_progress_bar:    'Progresa josla',
    lbl_progress_desc:   'Ekrāna apakšā',
    lbl_counter:         'Slaidu skaitītājs',
    lbl_counter_desc:    '"1 / N" stūrī',
    lbl_autoadvance:     'Automātiska pārsliešana',
    lbl_autoadvance_desc:'Pēc taimera',
    lbl_short_manual:    'Ieslēgt manuāli',
    lbl_short_manual_desc:'Aktīvs līdz atslēgšanai',
    lbl_short_dates:     'Ieplānotie saīsinātās dienas datumi',
    lbl_working_weekends_desc: 'Datumi, kas iekrīt brīvdienās (vai svētkos), bet kurās notiek stundas — šajās dienās tiks rādīts pašreizējās stundas indikators.',
    // Form labels – add item
    lbl_type:            'Tips',
    lbl_file:            'Fails',
    lbl_yt_link:         'YouTube saite',
    lbl_sheets_url:      'Google Sheets URL',
    lbl_date_col:        'Datuma kolonna',
    lbl_date_col_hint:   'Kolonnas nosaukums vai numurs (no 1), kurā ir datums. Ja iestatīts, ekrānā tiek rādītas tikai šodienas rindas.',
    lbl_switch_end:      'Pārslēgt, kad video beidzas',
    lbl_slide_title:     'Slaida nosaukums',
    // Form labels – group modal
    lbl_group_name:      'Grupas nosaukums',
    lbl_slide_dur:       'Slaida rādīšanas ilgums',
    lbl_slide_dur_hint:  'Tukšs — izmanto globālo vērtību no Iestatījumiem',
    lbl_group_active:    'Grupa aktīva (rādīt ekrānā)',
    // Form labels – change password
    lbl_current_password:'Pašreizējā parole',
    lbl_new_password:    'Jaunā parole',
    lbl_repeat_password: 'Atkārtojiet jauno paroli',
    lbl_user:            'Lietotājs',
    lbl_new_pwd_modal:   'Jaunā parole',
    // Table headers
    th_username:         'Lietotājvārds',
    th_created:          'Izveidots',
    th_actions:          'Darbības',
    th_time:             'Laiks',
    th_user:             'Lietotājs',
    th_action:           'Darbība',
    th_object:           'Objekts',
    th_lesson_num:       'Stundas Nr.',
    th_start:            'Sākums',
    th_end:              'Beigas',
    // Card & section titles
    card_player_iface:   'Atskaņotāja interfeiss',
    card_reg_users:      'Reģistrētie lietotāji',
    lbl_preview_card:    'Priekšskatījums 16:9',
    lbl_group_items:     'Grupas materiāli',
    lbl_drag_reorder:    'Velciet, lai mainītu secību',
    // Stats
    stat_groups:         'Grupas',
    stat_items:          'Materiāli',
    stat_active:         'Aktīvs',
    stat_disabled:       'Atspējots',
    // Badges & inline labels
    badge_active:        '● Aktīvs',
    badge_disabled:      '○ Atspējots',
    badge_off:           '○ Izsl.',
    hint_you:            '(jūs)',
    hint_items:          'mat.',
    // Display modes
    mode_blur:           '🌫️ Migla',
    mode_cover:          '⬛ Aizpildīt',
    mode_contain:        '⬜ Ietvert',
    // Media types
    type_image:          'Attēls',
    type_video:          'Video',
    // Empty states
    empty_group:         'Grupa ir tukša',
    empty_group_hint:    'Pievienojiet materiālus ar formu kreisajā pusē',
    empty_no_lessons:    'Nav stundu',
    empty_no_dates:      'Nav ieplānotu datumu',
    empty_no_records:    'Nav ierakstu',
    // Placeholders & hints
    hint_select_file:    'Atlasiet failu vai ievadiet URL',
    hint_img_files:      'JPG, PNG, WebP · Atļauti vairāki faili',
    hint_vid_files:      'MP4, WebM · Atļauti vairāki faili',
    hint_new_group:      'Jauna grupa',
    // Export
    export_desc:         'Eksportē grupu, materiālu un iestatījumu sarakstu JSON formātā. Multivides faili netiek iekļauti — tie glabājas serverī mapē uploads/.',
    btn_import:          '📥 Importēt',
    btn_import_ok:       'Importēt un aizstāt',
    btn_restore:         'Atjaunot',
    btn_save_snapshot:   '💾 Saglabāt momentuzņēmumu',
    sect_snapshots:      'Konfigurācijas momentuzņēmumi',
    snapshots_desc:      'Momentuzņēmums saglabā pilnu grupu, materiālu un iestatījumu kopu. Viens tiek izveidots automātiski pirms katra importa vai atjaunošanas.',
    snap_label_ph:       'Neobligāts nosaukums',
    snap_empty:          'Vēl nav momentuzņēmumu',
    snap_label_col:      'Nosaukums',
    snap_contents:       'Saturs',
    confirm_restore:     'Atjaunot šo momentuzņēmumu? Pašreizējās grupas, materiāli un iestatījumi tiks aizstāti. Vispirms tiek izveidots pašreizējā stāvokļa momentuzņēmums.',
    confirm_delete_snapshot: 'Dzēst šo momentuzņēmumu?',
    confirm_import:      'Importēt šo failu? Visas pašreizējās grupas, materiāli un iestatījumi tiks aizstāti. Vispirms tiek izveidots pašreizējā stāvokļa momentuzņēmums.',
    t_snapshot_saved:   'Momentuzņēmums saglabāts',
    t_snapshot_deleted: 'Momentuzņēmums dzēsts',
    t_restored:         'Konfigurācija atjaunota',
    t_imported:         (g, i) => `Importētas ${g} grupas, ${i} materiāli`,
    e_bad_json:         'Nederīgs JSON fails',
    // Activity action & type labels
    act_login:           'Pieslēgšanās',
    act_login_failed:    'Neizdevies mēģinājums',
    act_create:          'Izveidošana',
    act_update:          'Atjaunināšana',
    act_delete:          'Dzēšana',
    type_group:          'Grupa',
    type_item:           'Materiāls',
    type_settings:       'Iestatījumi',
    type_user:           'Lietotājs',
    // Toast messages
    t_item_added:        'Materiāls pievienots',
    t_item_disabled:     'Materiāls atspējots',
    t_item_enabled:      'Materiāls iespējots',
    t_item_deleted:      'Materiāls dzēsts',
    t_order_updated:     'Secība atjaunināta',
    t_group_order:       'Grupu secība atjaunināta',
    t_group_updated:     'Grupa atjaunināta',
    t_group_created:     'Grupa izveidota',
    t_group_deleted:     'Grupa dzēsta',
    t_settings_saved:    'Iestatījumi saglabāti',
    t_changes_saved:     'Izmaiņas saglabātas',
    t_user_created:      'Lietotājs izveidots',
    t_user_deleted:      'Lietotājs dzēsts',
    t_pwd_changed:       'Parole nomainīta',
    t_file_downloaded:   'Fails lejupielādēts',
    // Error messages
    e_enter_title:       'Ievadiet nosaukumu',
    e_enter_group_name:  'Ievadiet grupas nosaukumu',
    e_fill_fields:       'Aizpildiet visus laukus',
    e_enter_pwd:         'Ievadiet jauno paroli',
    e_date_format:       'Datuma formāts: DD.MM.GGGG',
    e_select_file:       'Atlasiet failu',
    e_enter_url:         'Ievadiet tabulas URL',
    e_yt_parse:          'Nevar parsēt YouTube saiti',
    e_pwd_mismatch:      'Jaunās paroles nesakrīt',
    e_pwd_min:           'Vismaz 8 rakstzīmes',
    e_enter_url_test:    'Ievadiet URL pirms pārbaudes',
    // Confirm messages (functions)
    confirm_delete_group:(name, n) => `Dzēst grupu "${name}" un visus ${n} materiālus tajā? Šo darbību nevar atsaukt.`,
    confirm_delete_item: (name) => `Dzēst "${name}"? Šo darbību nevar atsaukt.`,
    confirm_delete_user: (name) => `Dzēst lietotāju "${name}"?`,
    confirm_ok_delete:   'Dzēst',
    confirm_ok_del_grp:  'Dzēst grupu',
    // Upload & misc status
    uploading:           '⏳ augšupielādē…',
    uploaded:            '✔ augšupielādēts',
    upload_error:        '✖ kļūda',
    checking:            'Pārbauda…',
    uploading_item:      (n, total) => total > 1 ? `Augšupielādē ${n} / ${total}…` : 'Augšupielādē…',
    uploaded_items:      (n, total) => n === total ? (n > 1 ? `Augšupielādēti ${n} faili` : 'Materiāls pievienots') : `Augšupielādēti ${n} no ${total}`,
    // Schedule designer
    sd_content:          'Saturs',
    sd_rows_per_slide:   'Rindas vienā slaidā',
    sd_logo:             'Logotips',
    sd_heading:          'Slaida virsraksts',
    sd_school:           'Skolas nosaukums',
    sd_appearance:       'Izskats',
    sd_background:       'Fons',
    sd_bg_type:          'Tips',
    sd_gradient:         'Gradients',
    sd_solid:            'Vienkrāsains',
    sd_image:            'Attēls',
    sd_colour1:          'Krāsa 1',
    sd_colour2:          'Krāsa 2',
    sd_bg_colour:        'Fona krāsa',
    sd_bg_image:         'Fona attēls',
    sd_fit_mode:         'Pielāgošanas režīms',
    sd_cover:            'Aizpildīt',
    sd_contain:          'Ietvert',
    sd_typography:       'Tipogrāfija',
    sd_font_table:       'Fonts (tabula)',
    sd_font_header:      'Virsraksta fonts',
    sd_text_colour:      'Teksta krāsa',
    sd_text_hint:        'Attiecas uz virsrakstu, pulksteni, datumu un tabulas tekstu',
    sd_table:            'Tabula',
    sd_glassmorphism:    'Stikla efekts',
    sd_deco:             'Dekoratīvs raksts',
    sd_same_as_table:    'Tāpat kā tabulai',
    sd_font_noto:        'Noto Sans (ieteicams, latviešu)',
    sd_display_lang:     'Attēlošanas valoda',
    sd_lang_en:          'Angļu',
    sd_lang_lv:          'Latviešu',
  },
};

function applyLang(lang) {
  _lang = lang;
  document.documentElement.lang = lang;
  const t = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (typeof t[key] === 'string') el.textContent = t[key];
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Re-render components that contain translated text
  renderBellTable('regular');
  renderBellTable('shortened');
  renderShortDates();
  renderWorkingWeekendDates();
  if (groups.length) renderDashboard();
  if (items.length) renderItems();
  if (document.getElementById('snap-list')?.children.length) loadSnapshots();
  // Re-inject schedule designer if already open
  const schedInject = document.getElementById('sched-design-f');
  if (schedInject && schedInject.children.length) {
    schedInject.innerHTML = schedDesignHTML('f');
  }
}

function setLang(lang) {
  localStorage.setItem('skoluboard_lang', lang);
  applyLang(lang);
}

// ── Auth ─────────────────────────────────────────────────────────────

function getToken()  { return localStorage.getItem('skoluboard_token') || ''; }
function getUser()   { return localStorage.getItem('skoluboard_user')  || ''; }

// Set once /api/auth/me answers. Only 'superadmin' may manage other accounts;
// the server enforces this — the UI just hides what a plain 'admin' cannot use.
let currentRole = 'admin';
const isSuperadmin = () => currentRole === 'superadmin';

function logout() {
  const token = getToken();
  // Best-effort: tell the server to rotate token_version so the token cannot be
  // replayed. keepalive lets it finish after we navigate away. A dead token just
  // gets a harmless 401 here.
  if (token) {
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
  localStorage.removeItem('skoluboard_token');
  localStorage.removeItem('skoluboard_user');
  location.href = '/login.html';
}

// Check authentication on page load
(async () => {
  const token = getToken();
  if (!token) { location.href = '/login.html'; return; }
  try {
    const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { logout(); return; }
    const me = await r.json();
    currentRole = me.role || 'admin';
    document.getElementById('header-username').textContent = getUser();
    if (isSuperadmin()) {
      const navUsers = document.getElementById('nav-users');
      if (navUsers) navUsers.style.display = '';
    }
  } catch { logout(); }
})();

// ── API helper ────────────────────────────────────────────────────────

async function api(method, path, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${getToken()}` },
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(path, opts);
  if (r.status === 401) { logout(); throw new Error('Unauthorized'); }
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Server error');
  return data;
}

async function apiUpload(path, formData) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (r.status === 401) { logout(); throw new Error('Unauthorized'); }
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Upload error');
  return data;
}

// ── State ─────────────────────────────────────────────────────────────

let groups        = [];
let currentGroup  = null;
let items         = [];

// ── Navigation ────────────────────────────────────────────────────────

function nav(page) {
  if (page === 'users' && !isSuperadmin()) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  if (page === 'dashboard') loadDashboard();
  if (page === 'settings')  loadSettings();
  if (page === 'export') {
    document.getElementById('export-box').value = '';
    const ib = document.getElementById('import-btn');
    if (ib) ib.style.display = isSuperadmin() ? '' : 'none';
    loadSnapshots();
  }
  if (page === 'users')     loadUsers();
  if (page === 'activity')  loadActivity();
}

function openPlayer() { window.open('/', '_blank'); }

// ── Dashboard ─────────────────────────────────────────────────────────

async function loadDashboard() {
  try {
    groups = await api('GET', '/api/groups');
    renderSidebarGroups();
    renderDashboard();
    applyLang(_lang);
  } catch (e) { toast(e.message, 'error'); }
}

function renderDashboard() {
  const totalItems = groups.reduce((s, g) => s + (g.item_count || 0), 0);
  const activeGroups = groups.filter(g => g.active).length;

  const t = I18N[_lang] || I18N.en;
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat">
      <div class="stat-val">${groups.length}</div>
      <div class="stat-lbl">${t.stat_groups}</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--success)">${activeGroups}</div>
      <div class="stat-lbl">${t.stat_active}</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--primary)">${totalItems}</div>
      <div class="stat-lbl">${t.stat_items}</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:var(--warning)">${groups.filter(g=>!g.active).length}</div>
      <div class="stat-lbl">${t.stat_disabled}</div>
    </div>`;

  const cards = document.getElementById('group-cards');
  cards.innerHTML = '';

  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = `group-card${g.active ? '' : ' off'}`;
    card.draggable = true;
    card.dataset.idx = groups.indexOf(g);
    card.innerHTML = `
      <div class="group-drag-handle" title="Drag to reorder">⠿</div>
      <div class="group-card-icon">📁</div>
      <div style="flex:1;min-width:0">
        <div class="group-card-name">${esc(g.name)}</div>
        ${g.description ? `<div class="group-card-desc">${esc(g.description)}</div>` : ''}
      </div>
      <div class="group-card-meta">
        <span class="badge ${g.active ? 'badge-on' : 'badge-off'}">${g.active ? t.badge_active : t.badge_disabled}</span>
        <span style="font-size:11px;color:var(--muted)">${g.item_count} ${t.hint_items}</span>
        ${g.duration ? `<span style="font-size:11px;color:var(--muted)">⏱ ${g.duration/1000}s</span>` : ''}
        <div class="group-card-actions">
          <button class="btn btn-ghost btn-icon btn-sm" title="Edit"   onclick="event.stopPropagation();openEditGroup('${g.id}')">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" title="Delete" onclick="event.stopPropagation();deleteGroup('${g.id}')">🗑️</button>
        </div>
      </div>`;
    card.addEventListener('click', () => openGroup(g.id));
    setupGroupDrag(card, groups.indexOf(g));
    cards.appendChild(card);
  });

  // Add group card
  const addCard = document.createElement('div');
  addCard.className = 'add-group-card';
  addCard.innerHTML = '<span style="font-size:28px">＋</span><span>' + t.hint_new_group + '</span>';
  addCard.onclick = openAddGroup;
  cards.appendChild(addCard);
}

function renderSidebarGroups() {
  const el = document.getElementById('sidebar-groups');
  el.innerHTML = groups.map(g => `
    <div class="group-nav-item${currentGroup?.id === g.id ? ' active' : ''}" onclick="openGroup('${g.id}')">
      <span class="group-nav-dot ${g.active ? 'on' : 'off'}"></span>
      <span>${esc(g.name)}</span>
      <span class="nav-badge">${g.item_count ?? 0}</span>
    </div>`).join('');
}

// ── Group view ────────────────────────────────────────────────────────

async function openGroup(id) {
  currentGroup = groups.find(g => g.id === id) || null;
  if (!currentGroup) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item, .group-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-group').classList.add('active');
  document.querySelectorAll(`.group-nav-item`).forEach(el => {
    if (el.onclick?.toString().includes(id)) el.classList.add('active');
  });

  document.getElementById('group-page-title').textContent = currentGroup.name;
  document.getElementById('group-page-sub').textContent   = currentGroup.description || 'Item list';

  resetAddForm();
  await loadItems();
}

async function loadItems() {
  if (!currentGroup) return;
  try {
    items = await api('GET', `/api/groups/${currentGroup.id}/items`);
    renderItems();
  } catch (e) { toast(e.message, 'error'); }
}

function renderItems() {
  const list = document.getElementById('media-list');
  const t = I18N[_lang] || I18N.en;
  if (!items.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🖼️</div>
        <div class="empty-title">${t.empty_group}</div>
        <div style="font-size:13px;margin-top:4px">${t.empty_group_hint}</div>
      </div>`;
    return;
  }

  list.innerHTML = '';
  items.forEach((item, idx) => {
    const row = createItemRow(item, idx);
    setupDrag(row, idx);
    list.appendChild(row);
  });
}

function createItemRow(item, idx) {
  const t = I18N[_lang] || I18N.en;
  const row = document.createElement('div');
  row.className = `media-row${item.active ? '' : ' off'}`;
  row.dataset.id  = item.id;
  row.dataset.idx = idx;
  row.draggable   = true;

  row.innerHTML = `
    <div class="drag-handle">⠿</div>
    <div class="thumb">${thumbHTML(item)}</div>
    <div class="media-info">
      <div class="media-title" title="${esc(item.title)}">${esc(item.title)}</div>
      <div class="meta">
        <span class="badge badge-${item.type}">${item.type}</span>
        <span class="badge ${item.active ? 'badge-on' : 'badge-off'}">${item.active ? t.badge_active : t.badge_off}</span>
        ${(item.type === 'video' || item.type === 'youtube') && item.use_video_duration ? '<span class="meta-dur">⟳ auto</span>' : ''}
      </div>
    </div>
    <div class="row-actions">
      <button class="btn btn-ghost btn-icon btn-sm" data-action="preview" title="Preview">👁</button>
      <button class="btn btn-ghost btn-icon btn-sm" data-action="edit"    title="Edit">✏️</button>
      <button class="btn btn-ghost btn-icon btn-sm" data-action="toggle"  title="${item.active ? t.badge_active : t.badge_off}">${item.active ? '🔵' : '⚫'}</button>
      <button class="btn btn-ghost btn-icon btn-sm" data-action="del"     title="Delete">🗑️</button>
    </div>`;

  row.addEventListener('click', e => {
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'preview') openPreview(item.id);
    if (a === 'edit')    openEditItem(item.id);
    if (a === 'toggle')  toggleItem(item.id, item.active);
    if (a === 'del')     deleteItem(item.id, item.title);
  });

  return row;
}

function thumbHTML(item) {
  if (item.type === 'schedule') return `<span style="font-size:17px">📅</span>`;
  if (item.type === 'image') {
    return `<img src="${esc(item.src)}" alt="" loading="lazy"
                 onerror="this.parentNode.innerHTML='<span style=font-size:17px>🖼️</span>'">`;
  }
  if (item.type === 'video') {
    return `<video src="${esc(item.src)}" muted preload="metadata"></video>`;
  }
  const ytId = extractYtId(item.src);
  return ytId
    ? `<img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" alt=""
             onerror="this.parentNode.innerHTML='<span style=font-size:17px>▶️</span>'">`
    : `<span style="font-size:17px">▶️</span>`;
}

// ── Drag & drop ───────────────────────────────────────────────────────

let dragIdx = null;

function setupDrag(row, idx) {
  row.addEventListener('dragstart', e => {
    dragIdx = idx;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  row.addEventListener('dragend', () => {
    row.classList.remove('dragging');
    document.querySelectorAll('.media-row').forEach(r => r.classList.remove('drag-over'));
  });

  row.addEventListener('dragover', e => {
    e.preventDefault();
    document.querySelectorAll('.media-row').forEach(r => r.classList.remove('drag-over'));
    row.classList.add('drag-over');
  });

  row.addEventListener('drop', async e => {
    e.preventDefault();
    row.classList.remove('drag-over');
    const to = parseInt(row.dataset.idx);
    if (dragIdx === null || dragIdx === to) return;

    const [moved] = items.splice(dragIdx, 1);
    items.splice(to, 0, moved);
    renderItems();
    dragIdx = null;

    try {
      await api('POST', `/api/groups/${currentGroup.id}/items/reorder`, { order: items.map(i => i.id) });
      toast((I18N[_lang] || I18N.en).t_order_updated, 'success');
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ── Add item form ─────────────────────────────────────────────────────

let curType = 'image';
let previewObjectUrl = null;
let batchFiles = [];

function setType(t) {
  curType = t;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.t === t));
  document.getElementById('f-type').value = t;
  document.getElementById('g-file').style.display     = (t === 'image' || t === 'video') ? '' : 'none';
  document.getElementById('g-yt').style.display       = t === 'youtube'  ? '' : 'none';
  document.getElementById('g-schedule').style.display = t === 'schedule' ? '' : 'none';
  document.getElementById('g-vidur').style.display    = (t === 'video' || t === 'youtube') ? '' : 'none';

  const fFile = document.getElementById('f-file');
  fFile.accept = t === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm';
  const i18n = I18N[_lang] || I18N.en;
  document.getElementById('file-hint').textContent =
    t === 'image' ? i18n.hint_img_files : i18n.hint_vid_files;
  fFile.value = '';
  if (t === 'schedule') {
    document.getElementById('f-title-group').style.display = 'none';
    const inject = document.getElementById('sched-design-f');
    if (!inject.children.length) {
      inject.innerHTML = schedDesignHTML('f');
    }
  } else {
    document.getElementById('f-title-group').style.display = '';
  }

  // Reset batch upload list when type changes
  batchFiles = [];
  const batchEl = document.getElementById('f-batch-list');
  batchEl.style.display = 'none';
  batchEl.innerHTML     = '';
  document.getElementById('f-title-group').style.display = '';
  document.getElementById('f-title').placeholder = 'Slide title';

  revokePreview();
  updateFormPreview(null);
}

function setMode(m) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.m === m));
  document.getElementById('f-mode').value = m;
}

function revokePreview() {
  if (previewObjectUrl) { URL.revokeObjectURL(previewObjectUrl); previewObjectUrl = null; }
}

function onFileChange(input) {
  const files = Array.from(input.files);
  if (!files.length) return;

  batchFiles = files;
  revokePreview();

  if (files.length === 1) {
    _showSingleFile(files[0]);
  } else {
    document.getElementById('f-title-group').style.display = 'none';
    document.getElementById('f-title').value = '';
    updateFormPreview(null);
    renderBatchList();
  }
}

function _showSingleFile(file) {
  const batchEl = document.getElementById('f-batch-list');
  batchEl.style.display = 'none';
  batchEl.innerHTML     = '';
  document.getElementById('f-title-group').style.display = '';
  const titleInput = document.getElementById('f-title');
  titleInput.placeholder = 'Slide title';
  if (!titleInput.value) titleInput.value = file.name.replace(/\.[^.]+$/, '');
  revokePreview();
  previewObjectUrl = URL.createObjectURL(file);
  updateFormPreview({ type: curType, src: previewObjectUrl });
}

function renderBatchList() {
  const batchEl = document.getElementById('f-batch-list');
  batchEl.className    = 'batch-list';
  batchEl.style.display = '';
  batchEl.innerHTML = batchFiles.map((f, i) => `
    <div class="batch-item" data-idx="${i}">
      <span>${f.type.startsWith('video/') ? '🎬' : '🖼️'}</span>
      <span class="batch-item-name" title="${esc(f.name)}">${esc(f.name)}</span>
      <span class="batch-item-size">${fmtSize(f.size)}</span>
      <button type="button" class="batch-item-remove" onclick="removeBatchFile(${i})" title="Remove">✕</button>
    </div>`).join('');
}

function removeBatchFile(idx) {
  batchFiles.splice(idx, 1);

  if (batchFiles.length === 0) {
    document.getElementById('f-file').value = '';
    document.getElementById('f-batch-list').style.display = 'none';
    document.getElementById('f-batch-list').innerHTML = '';
    document.getElementById('f-title-group').style.display = '';
    document.getElementById('f-title').placeholder = 'Slide title';
    updateFormPreview(null);
  } else if (batchFiles.length === 1) {
    _showSingleFile(batchFiles[0]);
  } else {
    renderBatchList();
  }
}

function fmtSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function normalizeSheetUrl(input) {
  const raw = input.value.trim();
  if (!raw) return;
  try {
    const u = new URL(raw);
    // Extract spreadsheet ID from any Google Sheets URL
    const m = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (m) {
      // Determine sheet (gid) if present
      const gid = u.searchParams.get('gid') || u.hash.replace('#gid=', '') || '';
      const csv = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv${gid ? '&gid=' + gid : ''}`;
      if (input.value !== csv) input.value = csv;
      document.getElementById('sched-url-err').style.display = 'none';
    }
  } catch { /* not a valid URL yet, ignore */ }
}

async function testSheetUrl() {
  const url = document.getElementById('f-sheets-url').value.trim();
  const resultEl = document.getElementById('sched-test-result');
  const btn = document.getElementById('test-sheet-btn');

  const t = I18N[_lang] || I18N.en;
  if (!url) {
    const e = document.getElementById('sched-url-err');
    e.textContent = t.e_enter_url_test; e.style.display = '';
    return;
  }

  btn.disabled = true; btn.textContent = t.checking;
  resultEl.style.display = 'none';

  try {
    const r = await fetch(`/api/schedule/fetch?url=${encodeURIComponent(url)}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const text = await r.text();

    if (!r.ok) {
      throw new Error(`Server returned HTTP error ${r.status}. The spreadsheet may not be published.`);
    }
    if (text.trim().startsWith('<')) {
      throw new Error(
        'Received HTML instead of CSV — the spreadsheet is private or requires sign-in.\n' +
        'In Google Sheets click "Share" and set access to "Anyone with the link — Viewer".'
      );
    }
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('The spreadsheet is empty or contains only a header row.');

    resultEl.innerHTML = `✅ Connection successful. Data rows: <b>${lines.length - 1}</b>.`;
    resultEl.style.cssText = 'display:block;margin-top:6px;font-size:12px;padding:7px 10px;border-radius:6px;line-height:1.5;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d';
  } catch(e) {
    resultEl.innerHTML = e.message.replace(/\n/g, '<br>');
    resultEl.style.cssText = 'display:block;margin-top:6px;font-size:12px;padding:7px 10px;border-radius:6px;line-height:1.5;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c';
  } finally {
    btn.disabled = false; btn.textContent = t.btn_test_access;
  }
}

function onYtInput(input) {
  const url = input.value.trim();
  const err = document.getElementById('yt-err');
  if (!url) { err.style.display = 'none'; updateFormPreview(null); return; }
  const id = extractYtId(url);
  if (!id) { err.textContent = (I18N[_lang] || I18N.en).e_yt_parse; err.style.display = ''; updateFormPreview(null); return; }
  err.style.display = 'none';
  const t = document.getElementById('f-title');
  if (!t.value) t.value = 'YouTube video';
  updateFormPreview({ type: 'youtube', src: `https://www.youtube.com/embed/${id}` });
}

function updateFormPreview(item) {
  const el = document.getElementById('form-preview');
  el.innerHTML = item ? buildPreviewHTML(item) : '<div class="tv-placeholder">Select a file or enter a URL</div>';
}

function buildPreviewHTML(item) {
  if (item.type === 'schedule') {
    let cfg = {}; try { cfg = JSON.parse(item.src); } catch {}
    return `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#f4a63a,#d84d00);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff;font-family:system-ui">
      <div style="font-size:24px">📅</div>
      <div style="font-weight:700;font-size:14px;letter-spacing:.1em">${esc(cfg.title||'')}</div>
      <div style="font-size:11px;opacity:.7">${esc(cfg.schoolName||'')}</div>
    </div>`;
  }
  if (item.type === 'image') {
    return `<div style="position:absolute;inset:-10px;background:url('${item.src}') center/cover;filter:blur(20px) brightness(.3)"></div>
            <img src="${item.src}" style="object-fit:contain">`;
  }
  if (item.type === 'video') {
    return `<video src="${item.src}" controls muted style="object-fit:contain;background:#000"></video>`;
  }
  const ytBase = (item.src.match(/embed\/([^?&]+)/) || [])[1]
    ? `https://www.youtube.com/embed/${(item.src.match(/embed\/([^?&]+)/) || [])[1]}`
    : item.src;
  return `<iframe src="${ytBase}?autoplay=0&controls=1&rel=0" allow="fullscreen" allowfullscreen></iframe>`;
}

async function submitAddItem(e) {
  e.preventDefault();

  const type    = document.getElementById('f-type').value;
  const title   = document.getElementById('f-title').value.trim();
  const mode    = document.getElementById('f-mode').value;
  const active  = document.getElementById('f-active').checked;
  const vidur   = document.getElementById('f-vidur').checked;

  const t = I18N[_lang] || I18N.en;
  const btn = document.getElementById('f-submit');
  btn.disabled = true; btn.textContent = t.uploading;

  try {
    if (type === 'schedule') {
      const sheetsUrl = document.getElementById('f-sheets-url').value.trim();
      const urlErr    = document.getElementById('sched-url-err');
      if (!sheetsUrl) {
        urlErr.textContent = t.e_enter_url; urlErr.style.display = '';
        btn.disabled = false; btn.textContent = t.btn_add_item; return;
      }
      urlErr.style.display = 'none';

      const cfg = {
        sheetsUrl,
        dateColumn:   document.getElementById('f-date-col').value.trim(),
        rowsPerSlide: parseInt(document.getElementById('f-rows-slide').value)  || 14,
        title:        (document.getElementById('f-sched-title')?.value  || '').trim(),
        schoolName:   (document.getElementById('f-sched-school')?.value || '').trim(),
        logoUrl:      (document.getElementById('f-sched-logo')?.value   || '').trim(),
        theme:        collectTheme('f'),
      };

      const fd = new FormData();
      fd.append('type', 'schedule');
      fd.append('title', title || cfg.title);
      fd.append('youtube_url', JSON.stringify(cfg));
      fd.append('active', active ? '1' : '0');
      fd.append('display_mode', 'contain');
      await apiUpload(`/api/groups/${currentGroup.id}/items`, fd);
    } else if (type === 'youtube') {
      const url = document.getElementById('f-yt').value.trim();
      const id  = extractYtId(url);
      const err = document.getElementById('yt-err');
      if (!id) { err.textContent = t.e_yt_parse; err.style.display = ''; btn.disabled = false; btn.textContent = t.btn_add_item; return; }
      err.style.display = 'none';

      const fd = new FormData();
      fd.append('type', 'youtube');
      fd.append('title', title || 'YouTube video');
      fd.append('youtube_url', `https://www.youtube.com/embed/${id}`);
      fd.append('active', active ? '1' : '0');
      fd.append('display_mode', mode);
      fd.append('use_video_duration', vidur ? '1' : '0');
      await apiUpload(`/api/groups/${currentGroup.id}/items`, fd);
    } else {
      if (!batchFiles.length) { toast(t.e_select_file, 'error'); btn.disabled = false; btn.textContent = t.btn_add_item; return; }

      const batchEl    = document.getElementById('f-batch-list');
      const inListMode = batchEl.style.display !== 'none';
      const total      = batchFiles.length;
      let   uploaded   = 0;

      // Remove delete buttons during upload
      batchEl.querySelectorAll('.batch-item-remove').forEach(b => b.remove());

      for (let i = 0; i < total; i++) {
        const file = batchFiles[i];
        btn.textContent = t.uploading_item(uploaded + 1, total);

        const row = inListMode ? batchEl.querySelector(`.batch-item[data-idx="${i}"]`) : null;
        if (row) row.innerHTML =
          `<span>⏳</span><span class="batch-item-name">${esc(file.name)}</span><span class="batch-item-size">${fmtSize(file.size)}</span>`;

        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', type);
        fd.append('title', (total === 1 ? title : null) || file.name.replace(/\.[^.]+$/, ''));
        fd.append('active', active ? '1' : '0');
        fd.append('display_mode', mode);
        fd.append('use_video_duration', vidur ? '1' : '0');

        try {
          await apiUpload(`/api/groups/${currentGroup.id}/items`, fd);
          uploaded++;
          row?.remove(); // success — remove from visible list
        } catch (err) {
          if (row) row.innerHTML =
            `<span class="batch-item-err">✗</span><span class="batch-item-name batch-item-err">${esc(file.name)}: ${esc(err.message)}</span>`;
          toast(`${file.name}: ${err.message}`, 'error');
        }
      }

      batchFiles = []; // no need to re-submit

      if (uploaded > 0) {
        toast(t.uploaded_items(uploaded, total), 'success');
        await loadItems();
        await refreshGroupCount();
        if (uploaded === total) resetAddForm();
        // On errors the list remains with failed items; form is not reset
        return;
      }
    }

    toast(t.t_item_added, 'success');
    resetAddForm();
    await loadItems();
    await refreshGroupCount();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = t.btn_add_item;
  }
}

function resetAddForm() {
  document.getElementById('add-form').reset();
  batchFiles = [];
  curType = 'image';
  setType('image');
  setMode('blur');
  document.getElementById('f-active').checked = true;
  document.getElementById('yt-err').style.display  = 'none';
  document.getElementById('sched-url-err').style.display = 'none';
  const batchEl = document.getElementById('f-batch-list');
  batchEl.style.display = 'none';
  batchEl.innerHTML     = '';
  document.getElementById('f-title-group').style.display = '';
  document.getElementById('f-title').placeholder = 'Slide title';
  revokePreview();
  updateFormPreview(null);
}

// ── Item actions ──────────────────────────────────────────────────────

async function toggleItem(id, currentActive) {
  const t = I18N[_lang] || I18N.en;
  try {
    await api('PUT', `/api/items/${id}`, { active: !currentActive });
    await loadItems();
    toast(currentActive ? t.t_item_disabled : t.t_item_enabled, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

function deleteItem(id, title) {
  const t = I18N[_lang] || I18N.en;
  confirm2(t.confirm_delete_item(title), t.confirm_ok_delete, async () => {
    try {
      await api('DELETE', `/api/items/${id}`);
      toast(t.t_item_deleted, 'success');
      await loadItems();
      await refreshGroupCount();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ── Preview modal ─────────────────────────────────────────────────────

function openPreview(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('prev-title').textContent = item.title;
  document.getElementById('prev-frame').innerHTML   = buildPreviewHTML(item);
  document.getElementById('prev-overlay').classList.add('open');
}

function closePrev() {
  document.getElementById('prev-overlay').classList.remove('open');
  document.getElementById('prev-frame').innerHTML = '';
}

// ── Edit item modal ───────────────────────────────────────────────────

function updateSchedPreview() { /* live preview not implemented */ }

function openEditItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  if (item.type === 'schedule') {
    let cfg = {}; try { cfg = JSON.parse(item.src); } catch {}
    document.getElementById('edit-modal').style.width = 'min(900px, 92vw)';
    document.getElementById('edit-body').innerHTML = `
      <input type="hidden" id="em-id" value="${esc(item.id)}">
      <div class="form-group">
        <label>Title (in list)</label>
        <input type="text" id="em-title" value="${esc(item.title)}" maxlength="80">
      </div>
      <div class="form-group">
        <label>Google Sheets URL</label>
        <input type="url" id="em-sheets-url" value="${esc(cfg.sheetsUrl||'')}">
        <div class="form-hint">Spreadsheet accessible to "Anyone with the link — Viewer"</div>
      </div>
      <div class="form-group">
        <label>Date column</label>
        <input type="text" id="em-date-col" value="${esc(cfg.dateColumn||'')}">
        <div class="form-hint">Name or number of the date column. Only today's rows are shown.</div>
      </div>
      <div class="form-group">
        <label>Display language</label>
        <select id="em-sched-lang">
          <option value="en">English</option>
          <option value="lv">Latvian</option>
        </select>
      </div>
      <div class="form-group">
        <label class="check-label">
          <input type="checkbox" id="em-active" ${item.active?'checked':''}> Show on screen
        </label>
      </div>
      ${schedDesignHTML('em', cfg)}`;
    document.getElementById('edit-overlay').classList.add('open');
    setTimeout(() => {
      if (cfg.theme) applyThemeToForm('em', cfg.theme);
      const langEl = document.getElementById('em-sched-lang');
      if (langEl) langEl.value = cfg.lang || 'en';
    }, 0);
    return;
  }

  document.getElementById('edit-body').innerHTML = `
    <input type="hidden" id="em-id" value="${esc(item.id)}">
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="em-title" value="${esc(item.title)}" maxlength="80">
    </div>
    <div class="form-group">
      <label>Display mode</label>
      <select id="em-mode">
        <option value="blur"    ${item.display_mode==='blur'   ?'selected':''}>🌫️ Blur</option>
        <option value="cover"   ${item.display_mode==='cover'  ?'selected':''}>⬛ Cover</option>
        <option value="contain" ${item.display_mode==='contain'?'selected':''}>⬜ Contain</option>
      </select>
    </div>
    ${(item.type === 'video' || item.type === 'youtube') ? `
    <div class="form-group">
      <label class="check-label">
        <input type="checkbox" id="em-vidur" ${item.use_video_duration?'checked':''}> Switch when video ends
      </label>
    </div>` : ''}
    <div class="form-group">
      <label class="check-label">
        <input type="checkbox" id="em-active" ${item.active?'checked':''}> Show on screen
      </label>
    </div>`;

  document.getElementById('edit-overlay').classList.add('open');
}

async function saveEditItem() {
  const t = I18N[_lang] || I18N.en;
  const id    = document.getElementById('em-id').value;
  const title = document.getElementById('em-title').value.trim();
  const act   = document.getElementById('em-active').checked;

  if (!title) { toast(t.e_enter_title, 'error'); return; }

  const item = items.find(i => i.id === id);

  if (item?.type === 'schedule') {
    const sheetsUrl = document.getElementById('em-sheets-url').value.trim();
    if (!sheetsUrl) { toast(t.e_enter_url, 'error'); return; }
    let cfg = {}; try { cfg = JSON.parse(item.src); } catch {}
    const newCfg = {
      ...cfg,
      sheetsUrl,
      dateColumn:   document.getElementById('em-date-col').value.trim(),
      rowsPerSlide: parseInt(document.getElementById('em-rows-slide').value) || 14,
      title:        document.getElementById('em-sched-title').value.trim()   || '',
      schoolName:   document.getElementById('em-sched-school').value.trim()  || '',
      logoUrl:      document.getElementById('em-sched-logo').value.trim()    || '',
      theme:        collectTheme('em'),
      lang: document.getElementById('em-sched-lang').value || 'en',
    };
    try {
      await api('PUT', `/api/items/${id}`, { title, src: JSON.stringify(newCfg), active: act });
      closeEditItem();
      await loadItems();
      toast(t.t_changes_saved, 'success');
    } catch (e) { toast(e.message, 'error'); }
    return;
  }

  const mode  = document.getElementById('em-mode').value;
  const vidur = document.getElementById('em-vidur')?.checked ?? false;

  try {
    await api('PUT', `/api/items/${id}`, {
      title, display_mode: mode, active: act, use_video_duration: vidur,
    });
    closeEditItem();
    await loadItems();
    toast(t.t_changes_saved, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

function closeEditItem() {
  document.getElementById('edit-overlay').classList.remove('open');
  document.getElementById('edit-modal').style.width = '440px';
}

// ── Groups management ─────────────────────────────────────────────────

function openAddGroup() {
  document.getElementById('gm-id').value      = '';
  document.getElementById('gm-name').value    = '';
  document.getElementById('gm-desc').value    = '';
  document.getElementById('gm-dur').value     = '';
  document.getElementById('gm-active').checked = true;
  const t = I18N[_lang] || I18N.en;
  document.getElementById('group-modal-title').textContent = t.modal_add_group;
  document.getElementById('gm-submit').textContent = t.btn_create;
  document.getElementById('group-overlay').classList.add('open');
  setTimeout(() => document.getElementById('gm-name').focus(), 50);
}

function openEditGroup(id) {
  const g = groups.find(x => x.id === id);
  if (!g) return;
  document.getElementById('gm-id').value       = g.id;
  document.getElementById('gm-name').value     = g.name;
  document.getElementById('gm-desc').value     = g.description || '';
  document.getElementById('gm-dur').value      = g.duration ? g.duration / 1000 : '';
  document.getElementById('gm-active').checked = g.active;
  document.getElementById('group-modal-title').textContent = (I18N[_lang] || I18N.en).modal_edit_group;
  document.getElementById('gm-submit').textContent = (I18N[_lang] || I18N.en).btn_save;
  document.getElementById('group-overlay').classList.add('open');
}

function editCurrentGroup() {
  if (currentGroup) openEditGroup(currentGroup.id);
}

async function saveGroup() {
  const t = I18N[_lang] || I18N.en;
  const id     = document.getElementById('gm-id').value;
  const name   = document.getElementById('gm-name').value.trim();
  const desc   = document.getElementById('gm-desc').value.trim();
  const durVal = document.getElementById('gm-dur').value;
  const active = document.getElementById('gm-active').checked;

  if (!name) { toast(t.e_enter_group_name, 'error'); return; }

  try {
    const dur = durVal ? Math.round(Number(durVal) * 1000) : null;
    if (id) {
      await api('PUT', `/api/groups/${id}`, { name, description: desc, active, duration: dur });
      toast(t.t_group_updated, 'success');
    } else {
      await api('POST', '/api/groups', { name, description: desc, duration: dur });
      toast(t.t_group_created, 'success');
    }
    closeGroupModal();
    await loadDashboard();
    if (currentGroup?.id === id) {
      currentGroup = groups.find(g => g.id === id);
      document.getElementById('group-page-title').textContent = currentGroup?.name || '';
    }
  } catch (e) { toast(e.message, 'error'); }
}

function closeGroupModal() { document.getElementById('group-overlay').classList.remove('open'); }

let groupDragIdx = null;

function setupGroupDrag(card, idx) {
  card.addEventListener('dragstart', e => {
    groupDragIdx = idx;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.group-card').forEach(c => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', e => {
    e.preventDefault();
    document.querySelectorAll('.group-card').forEach(c => c.classList.remove('drag-over'));
    card.classList.add('drag-over');
  });
  card.addEventListener('drop', async e => {
    e.preventDefault();
    card.classList.remove('drag-over');
    const to = parseInt(card.dataset.idx);
    if (groupDragIdx === null || groupDragIdx === to) return;
    const [moved] = groups.splice(groupDragIdx, 1);
    groups.splice(to, 0, moved);
    groupDragIdx = null;
    renderDashboard();
    renderSidebarGroups();
    try {
      await api('POST', '/api/groups/reorder', { order: groups.map(g => g.id) });
      toast((I18N[_lang] || I18N.en).t_group_order, 'success');
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function moveGroup(id, dir) {
  const idx = groups.findIndex(g => g.id === id);
  if (idx < 0) return;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= groups.length) return;
  [groups[idx], groups[newIdx]] = [groups[newIdx], groups[idx]];
  try {
    await api('POST', '/api/groups/reorder', { order: groups.map(g => g.id) });
    renderDashboard();
    renderSidebarGroups();
  } catch (e) { toast(e.message, 'error'); }
}

function deleteGroup(id) {
  const t = I18N[_lang] || I18N.en;
  const g = groups.find(x => x.id === id);
  if (!g) return;
  confirm2(
    t.confirm_delete_group(g.name, g.item_count),
    t.confirm_ok_del_grp,
    async () => {
      try {
        await api('DELETE', `/api/groups/${id}`);
        toast(t.t_group_deleted, 'success');
        if (currentGroup?.id === id) {
          currentGroup = null;
          nav('dashboard');
        } else {
          await loadDashboard();
        }
      } catch (e) { toast(e.message, 'error'); }
    }
  );
}

function deleteCurrentGroup() {
  if (currentGroup) deleteGroup(currentGroup.id);
}

async function refreshGroupCount() {
  groups = await api('GET', '/api/groups');
  renderSidebarGroups();
}

// ── Settings ──────────────────────────────────────────────────────────

let bellData = { regular: [], shortened: [], shortDayManual: false, shortDayDates: [], workingWeekendDates: [] };

function switchBellTab(tab) {
  document.getElementById('bell-tab-reg').classList.toggle('active', tab === 'regular');
  document.getElementById('bell-tab-short').classList.toggle('active', tab === 'shortened');
  document.getElementById('bell-sched-regular').style.display   = tab === 'regular'   ? '' : 'none';
  document.getElementById('bell-sched-shortened').style.display = tab === 'shortened' ? '' : 'none';
}

function renderBellTable(type) {
  const t = I18N[_lang] || I18N.en;
  const rows = bellData[type];
  const container = document.getElementById(`bell-table-${type}`);
  if (!rows.length) {
    container.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:4px 0">${t.empty_no_lessons}</div>`;
    return;
  }
  container.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="border-bottom:1px solid var(--border)">
      <th style="text-align:left;padding:4px 8px;width:70px">${t.th_lesson_num}</th>
      <th style="text-align:left;padding:4px 8px;width:120px">${t.th_start}</th>
      <th style="text-align:left;padding:4px 8px;width:120px">${t.th_end}</th>
      <th style="width:32px"></th>
    </tr></thead>
    <tbody>${rows.map((r, i) => `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px 8px"><input type="number" min="1" max="20" value="${r.lesson}" style="width:50px" onchange="updateBellRow('${type}',${i},'lesson',this.value)"></td>
      <td style="padding:4px 8px"><input type="text" value="${r.start}" placeholder="HH:MM" pattern="[0-2][0-9]:[0-5][0-9]" maxlength="5" style="width:70px;text-align:center" onchange="updateBellRow('${type}',${i},'start',this.value)"></td>
      <td style="padding:4px 8px"><input type="text" value="${r.end}" placeholder="HH:MM" pattern="[0-2][0-9]:[0-5][0-9]" maxlength="5" style="width:70px;text-align:center" onchange="updateBellRow('${type}',${i},'end',this.value)"></td>
      <td style="padding:4px 8px"><button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5;padding:2px 7px" onclick="removeBellRow('${type}',${i})">✕</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function updateBellRow(type, idx, field, value) {
  bellData[type][idx][field] = field === 'lesson' ? parseInt(value) || 1 : value;
}

function addBellRow(type) {
  const rows = bellData[type];
  const lastLesson = rows.length ? rows[rows.length - 1].lesson + 1 : 1;
  rows.push({ lesson: lastLesson, start: '08:00', end: '08:45' });
  renderBellTable(type);
}

function removeBellRow(type, idx) {
  bellData[type].splice(idx, 1);
  renderBellTable(type);
}

function isoToDisplay(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function displayToIso(display) {
  const [d, m, y] = display.split('.');
  if (!d || !m || !y || y.length !== 4) return null;
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function renderShortDates() {
  const t = I18N[_lang] || I18N.en;
  const list = document.getElementById('s-short-dates-list');
  if (!list) return;
  if (!bellData.shortDayDates.length) {
    list.innerHTML = `<div style="font-size:13px;color:var(--muted);padding:4px 0">${t.empty_no_dates}</div>`;
    return;
  }
  list.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:4px">
    <tbody>${bellData.shortDayDates.map((iso, i) => `
      <tr style="border-bottom:1px solid var(--border)">
        <td style="padding:6px 8px">${isoToDisplay(iso)}</td>
        <td style="padding:6px 8px;width:32px;text-align:right">
          <button onclick="removeShortDate(${i})" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:15px;line-height:1;padding:0" title="Remove">✕</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function addShortDate() {
  const inp = document.getElementById('s-short-date-input');
  const raw = inp.value.trim();
  if (!raw) return;
  const iso = displayToIso(raw);
  if (!iso) { toast((I18N[_lang] || I18N.en).e_date_format, 'error'); return; }
  if (!bellData.shortDayDates.includes(iso)) {
    bellData.shortDayDates.push(iso);
    bellData.shortDayDates.sort();
    renderShortDates();
  }
  inp.value = '';
}

function removeShortDate(idx) {
  bellData.shortDayDates.splice(idx, 1);
  renderShortDates();
}

function renderWorkingWeekendDates() {
  const t = I18N[_lang] || I18N.en;
  const list = document.getElementById('s-working-dates-list');
  if (!list) return;
  if (!bellData.workingWeekendDates.length) {
    list.innerHTML = `<div style="font-size:13px;color:var(--muted);padding:4px 0">${t.empty_no_dates}</div>`;
    return;
  }
  list.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:4px">
    <tbody>${bellData.workingWeekendDates.map((iso, i) => `
      <tr style="border-bottom:1px solid var(--border)">
        <td style="padding:6px 8px">${isoToDisplay(iso)}</td>
        <td style="padding:6px 8px;width:32px;text-align:right">
          <button onclick="removeWorkingWeekendDate(${i})" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:15px;line-height:1;padding:0" title="Remove">✕</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function addWorkingWeekendDate() {
  const inp = document.getElementById('s-working-date-input');
  const raw = inp.value.trim();
  if (!raw) return;
  const iso = displayToIso(raw);
  if (!iso) { toast((I18N[_lang] || I18N.en).e_date_format, 'error'); return; }
  if (!bellData.workingWeekendDates.includes(iso)) {
    bellData.workingWeekendDates.push(iso);
    bellData.workingWeekendDates.sort();
    renderWorkingWeekendDates();
  }
  inp.value = '';
}

function removeWorkingWeekendDate(idx) {
  bellData.workingWeekendDates.splice(idx, 1);
  renderWorkingWeekendDates();
}

async function loadSettings() {
  try {
    const [s, bell] = await Promise.all([
      api('GET', '/api/settings'),
      fetch('/api/bell').then(r => r.json()),
    ]);
    document.getElementById('s-dur').value    = s.defaultDuration / 1000;
    document.getElementById('s-tr').value     = s.transition / 1000;
    document.getElementById('s-prog').checked = s.showProgress;
    document.getElementById('s-cnt').checked  = s.showCounter;
    document.getElementById('s-auto').checked = s.autoAdvance;

    bellData = { workingWeekendDates: [], ...bell };
    document.getElementById('s-short-manual').checked = bell.shortDayManual;
    renderBellTable('regular');
    renderBellTable('shortened');
    renderShortDates();
    renderWorkingWeekendDates();
  } catch (e) { toast(e.message, 'error'); }
}

async function saveSettings() {
  try {
    await api('PUT', '/api/settings', {
      defaultDuration: Math.round((Number(document.getElementById('s-dur').value) || 8) * 1000),
      transition:      Math.round((Number(document.getElementById('s-tr').value) || 1) * 1000),
      showProgress:    document.getElementById('s-prog').checked,
      showCounter:     document.getElementById('s-cnt').checked,
      autoAdvance:     document.getElementById('s-auto').checked,
      bellScheduleRegular:   JSON.stringify(bellData.regular),
      bellScheduleShortened: JSON.stringify(bellData.shortened),
      shortDayManual:       document.getElementById('s-short-manual').checked,
      shortDayDates:        JSON.stringify(bellData.shortDayDates),
      workingWeekendDates:  JSON.stringify(bellData.workingWeekendDates),
    });
    toast((I18N[_lang] || I18N.en).t_settings_saved, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

// ── Users ─────────────────────────────────────────────────────────────


async function loadUsers() {
  try {
    const users = await api('GET', '/api/users');
    const me = await api('GET', '/api/auth/me');
    const tbody = document.getElementById('users-tbody');
    const t = I18N[_lang] || I18N.en;
    tbody.innerHTML = users.map(u => `
      <tr style="border-bottom:1px solid var(--border)">
        <td style="padding:10px 16px">
          ${esc(u.username)}
          ${u.id === me.id ? `<span style="font-size:11px;color:var(--muted);margin-left:6px">${t.hint_you}</span>` : ''}
        </td>
        <td style="padding:10px 16px;color:var(--muted)">${new Date(u.created_at).toLocaleString('en')}</td>
        <td style="padding:10px 16px;text-align:right;white-space:nowrap">
          <button class="btn btn-sm btn-ghost" onclick="openChangePw(${u.id},'${esc(u.username)}')">${t.btn_pwd_user}</button>
          ${u.id !== me.id ? `<button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5;margin-left:4px" onclick="deleteUser(${u.id},'${esc(u.username)}')">🗑</button>` : ''}
        </td>
      </tr>`).join('');
    applyLang(_lang);
  } catch (e) { toast(e.message, 'error'); }
}

function openAddUser() {
  document.getElementById('au-username').value = '';
  document.getElementById('au-password').value = '';
  document.getElementById('modal-add-user').classList.add('show');
}

async function saveNewUser() {
  const username = document.getElementById('au-username').value.trim();
  const password = document.getElementById('au-password').value;
  const t = I18N[_lang] || I18N.en;
  if (!username || !password) { toast(t.e_fill_fields, 'error'); return; }
  try {
    await api('POST', '/api/users', { username, password });
    closeModal('modal-add-user');
    toast(t.t_user_created, 'success');
    loadUsers();
  } catch (e) { toast(e.message, 'error'); }
}

function openChangePw(id, username) {
  document.getElementById('cpw-user-id').value = id;
  document.getElementById('cpw-username').value = username;
  document.getElementById('cpw-password').value = '';
  document.getElementById('modal-change-pw').classList.add('show');
}

async function saveChangePw() {
  const id = document.getElementById('cpw-user-id').value;
  const newPassword = document.getElementById('cpw-password').value;
  const t = I18N[_lang] || I18N.en;
  if (!newPassword) { toast(t.e_enter_pwd, 'error'); return; }
  try {
    await api('PUT', `/api/users/${id}/password`, { newPassword });
    closeModal('modal-change-pw');
    toast(t.t_pwd_changed, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteUser(id, username) {
  const t = I18N[_lang] || I18N.en;
  if (!confirm(t.confirm_delete_user(username))) return;
  try {
    await api('DELETE', `/api/users/${id}`);
    toast(t.t_user_deleted, 'success');
    loadUsers();
  } catch (e) { toast(e.message, 'error'); }
}

// ── Activity log ──────────────────────────────────────────────────────

const ACTION_COLORS = {
  login: '#009EF5', login_failed: '#ef4444', create: '#2DB86A', update: '#f59e0b', delete: '#ef4444',
};

let _activityOffset = 0;

async function loadActivity(more = false) {
  if (!more) _activityOffset = 0;
  try {
    const t = I18N[_lang] || I18N.en;
    const data = await api('GET', `/api/activity?limit=50&offset=${_activityOffset}`);
    const tbody = document.getElementById('activity-tbody');
    const rows = data.rows.map(r => {
      const dt = new Date(r.created_at).toLocaleString('en');
      const action = t[`act_${r.action}`] || r.action;
      const color  = ACTION_COLORS[r.action] || '#64748b';
      const type   = r.object_type ? (t[`type_${r.object_type}`] || r.object_type) : '';
      const name   = r.object_name ? ` — ${esc(r.object_name)}` : '';
      return `<tr style="border-bottom:1px solid var(--border)">
        <td style="padding:8px 16px;color:var(--muted);white-space:nowrap;font-size:12px">${dt}</td>
        <td style="padding:8px 16px;font-weight:500">${esc(r.username)}</td>
        <td style="padding:8px 16px"><span style="color:${color};font-weight:500">${action}</span></td>
        <td style="padding:8px 16px;font-size:12px">${type}${name}</td>
        <td style="padding:8px 16px;font-size:12px;color:var(--muted)">${esc(r.ip) || '—'}</td>
      </tr>`;
    }).join('');

    if (more) {
      tbody.insertAdjacentHTML('beforeend', rows);
    } else {
      tbody.innerHTML = rows || `<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--muted)">${t.empty_no_records}</td></tr>`;
    }
    _activityOffset += data.rows.length;
    document.getElementById('activity-more').style.display =
      _activityOffset < data.total ? '' : 'none';
    applyLang(_lang);
  } catch (e) { toast(e.message, 'error'); }
}

// ── Export ────────────────────────────────────────────────────────────

async function loadExportPreview() {
  try {
    const data = await api('GET', '/api/export');
    document.getElementById('export-box').value = JSON.stringify(data, null, 2);
  } catch (e) { toast(e.message, 'error'); }
}

async function doExport() {
  try {
    const data = await api('GET', '/api/export');
    const json = JSON.stringify(data, null, 2);
    const a    = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([json], { type: 'application/json' })),
      download: `skoluboard-${new Date().toISOString().slice(0,10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    document.getElementById('export-box').value = json;
    toast((I18N[_lang] || I18N.en).t_file_downloaded, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ── Import ────────────────────────────────────────────────────────────

async function importConfig(input) {
  const t = I18N[_lang] || I18N.en;
  const file = input.files[0];
  input.value = '';
  if (!file) return;

  let cfg;
  try { cfg = JSON.parse(await file.text()); }
  catch { toast(t.e_bad_json, 'error'); return; }

  confirm2(t.confirm_import, t.btn_import_ok, async () => {
    try {
      const r = await api('POST', '/api/config/import', cfg);
      toast(t.t_imported(r.groups, r.items), 'success');
      currentGroup = null;
      await loadDashboard();
      loadSnapshots();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ── Config snapshots ─────────────────────────────────────────────────

async function loadSnapshots() {
  const t = I18N[_lang] || I18N.en;
  const el = document.getElementById('snap-list');
  if (!el) return;
  const lbl = document.getElementById('snap-label');
  if (lbl) lbl.placeholder = t.snap_label_ph;
  try {
    const rows = await api('GET', '/api/config/snapshots');
    if (!rows.length) {
      el.innerHTML = `<div style="color:var(--muted);font-size:13px">${t.snap_empty}</div>`;
      return;
    }
    el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:1px solid var(--border);text-align:left;color:var(--muted)">
        <th style="padding:6px 8px">${t.th_time}</th>
        <th style="padding:6px 8px">${t.snap_label_col}</th>
        <th style="padding:6px 8px">${t.th_user}</th>
        <th style="padding:6px 8px">${t.snap_contents}</th>
        <th style="padding:6px 8px"></th>
      </tr></thead>
      <tbody>${rows.map(r => `
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:6px 8px;white-space:nowrap">${new Date(r.created_at.replace(' ', 'T')).toLocaleString('en')}</td>
          <td style="padding:6px 8px">${r.kind === 'auto' ? '<span title="auto" style="opacity:.55">⚙ </span>' : ''}${esc(r.label) || '<span style="opacity:.4">—</span>'}</td>
          <td style="padding:6px 8px">${esc(r.username || '')}</td>
          <td style="padding:6px 8px;color:var(--muted)">${r.n_groups} · ${r.n_items}</td>
          <td style="padding:6px 8px;text-align:right;white-space:nowrap">
            <button class="btn btn-sm btn-ghost" title="Download" onclick="downloadSnapshot(${r.id})">⬇</button>
            ${isSuperadmin() ? `
            <button class="btn btn-sm" style="margin-left:4px" onclick="restoreSnapshot(${r.id})">${t.btn_restore}</button>
            <button class="btn btn-sm" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5;margin-left:4px" onclick="deleteSnapshot(${r.id})">🗑</button>` : ''}
          </td>
        </tr>`).join('')}</tbody></table>`;
  } catch (e) { toast(e.message, 'error'); }
}

async function saveSnapshot() {
  const t = I18N[_lang] || I18N.en;
  const inp = document.getElementById('snap-label');
  try {
    await api('POST', '/api/config/snapshots', { label: inp.value.trim() });
    inp.value = '';
    toast(t.t_snapshot_saved, 'success');
    loadSnapshots();
  } catch (e) { toast(e.message, 'error'); }
}

function restoreSnapshot(id) {
  const t = I18N[_lang] || I18N.en;
  confirm2(t.confirm_restore, t.btn_restore, async () => {
    try {
      await api('POST', `/api/config/snapshots/${id}/restore`);
      toast(t.t_restored, 'success');
      currentGroup = null;
      await loadDashboard();
      loadSnapshots();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function deleteSnapshot(id) {
  const t = I18N[_lang] || I18N.en;
  confirm2(t.confirm_delete_snapshot, t.confirm_ok_delete, async () => {
    try {
      await api('DELETE', `/api/config/snapshots/${id}`);
      toast(t.t_snapshot_deleted, 'success');
      loadSnapshots();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function downloadSnapshot(id) {
  fetch(`/api/config/snapshots/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    .then(r => r.ok ? r.text() : r.json().then(d => Promise.reject(new Error(d.error || 'Error'))))
    .then(text => {
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([text], { type: 'application/json' })),
        download: `skoluboard-snapshot-${id}.json`,
      });
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(e => toast(e.message, 'error'));
}

// ── Change password ───────────────────────────────────────────────────

function openChangePassword()  { document.getElementById('pass-overlay').classList.add('open'); }
function closeChangePassword() { document.getElementById('pass-overlay').classList.remove('open'); }

async function changePassword() {
  const current  = document.getElementById('pw-current').value;
  const newPass  = document.getElementById('pw-new').value;
  const newPass2 = document.getElementById('pw-new2').value;

  const t = I18N[_lang] || I18N.en;
  if (newPass !== newPass2) { toast(t.e_pwd_mismatch, 'error'); return; }
  if (newPass.length < 8)   { toast(t.e_pwd_min, 'error'); return; }

  try {
    // The server rotates token_version and returns a fresh token for this
    // session; store it so we are not logged out by our own password change.
    const res = await api('PUT', '/api/auth/password', { current, newPassword: newPass });
    if (res?.token) localStorage.setItem('skoluboard_token', res.token);
    closeChangePassword();
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value     = '';
    document.getElementById('pw-new2').value    = '';
    toast(t.t_pwd_changed, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ── Schedule theme designer ──────────────────────────────────────────

function toggleDesign(pfx) {
  const body = document.getElementById(`design-body-${pfx}`);
  const head = document.getElementById(`design-head-${pfx}`);
  const open = body.classList.toggle('open');
  head.classList.toggle('open', open);
  document.getElementById(`design-arr-${pfx}`).textContent = open ? '▾' : '▸';
  if (open) {
    // ensure hidden bgType input exists
    if (!document.getElementById(`${pfx}-th-bg-type`)) {
      const h = document.createElement('input');
      h.type = 'hidden'; h.id = `${pfx}-th-bg-type`; h.value = 'gradient';
      document.getElementById(`design-body-${pfx}`).appendChild(h);
    }
  
  }
}


async function uploadSchedImg(fileInput, hiddenId, prevId) {
  const file = fileInput.files[0];
  if (!file) return;
  const prev = document.getElementById(prevId);
  const t = I18N[_lang] || I18N.en;
  if (prev) prev.textContent = t.uploading;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const resp = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Upload error');
    document.getElementById(hiddenId).value = data.url;
    if (prev) prev.textContent = t.uploaded;
  } catch (e) {
    if (prev) prev.textContent = t.upload_error;
    toast(e.message, 'error');
  }
}

function syncColor(el, targetId) {
  const t = document.getElementById(targetId);
  if (t) t.value = el.value;
}

function setBgType(pfx, type) {
  ['gradient','solid','image'].forEach(t => {
    const el = document.getElementById(`${pfx}-bg-${t}`);
    if (el) el.style.display = t === type ? '' : 'none';
  });
  document.querySelectorAll(`#${pfx}-bg-type-ctrl .seg-btn`)
    .forEach(b => b.classList.toggle('active', b.dataset.v === type));
  document.getElementById(`${pfx}-th-bg-type`).value = type;

}

function collectTheme(pfx) {
  const g  = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const gc = id => { const el = document.getElementById(id); return el ? el.checked : true; };
  const gn = id => { const el = document.getElementById(id); return el ? parseInt(el.value) : null; };
  // bgType stored in a hidden input we inject via applyThemeToForm/setBgType
  const bgTypeEl = document.getElementById(`${pfx}-th-bg-type`);
  const bgType = bgTypeEl ? bgTypeEl.value : 'gradient';
  return {
    bgType,
    bgFrom:       g(`${pfx}-th-bg-from`)     || '#f4a63a',
    bgTo:         g(`${pfx}-th-bg-to`)       || '#d84d00',
    bgAngle:      gn(`${pfx}-th-angle`)      ?? 180,
    bgSolid:      g(`${pfx}-th-bg-solid`)    || '#1a1a2e',
    bgImageUrl:   g(`${pfx}-th-bg-img`)      || '',
    bgImageFit:   g(`${pfx}-th-bg-img-fit`)  || 'cover',
    bgOverlay:    gn(`${pfx}-th-ovl`)        ?? 50,
    fontFamily:   g(`${pfx}-th-font`)        || "'Segoe UI',Arial,sans-serif",
    headerFont:   g(`${pfx}-th-hfont`)       || '',
    textColor:    g(`${pfx}-th-tcol-t`)       || '#ffffff',
    tableOpacity: gn(`${pfx}-th-op`)         ?? 13,
    tableRadius:  gn(`${pfx}-th-rad`)        ?? 12,
    tableBlur:    gc(`${pfx}-th-blur`),
    decoVisible:  gc(`${pfx}-th-deco`),
  };
}

function applyThemeToForm(pfx, theme) {
  if (!theme) return;
  const set  = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const setC = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  // background type
  const bgType = theme.bgType || 'gradient';
  // inject hidden input for bgType if not present
  let btEl = document.getElementById(`${pfx}-th-bg-type`);
  if (!btEl) {
    btEl = document.createElement('input');
    btEl.type = 'hidden'; btEl.id = `${pfx}-th-bg-type`; btEl.value = bgType;
    document.getElementById(`design-body-${pfx}`)?.appendChild(btEl);
  }
  setBgType(pfx, bgType);

  set(`${pfx}-th-bg-from`,    theme.bgFrom   || '#f4a63a');
  set(`${pfx}-th-bg-from-t`,  theme.bgFrom   || '#f4a63a');
  set(`${pfx}-th-bg-to`,      theme.bgTo     || '#d84d00');
  set(`${pfx}-th-bg-to-t`,    theme.bgTo     || '#d84d00');
  set(`${pfx}-th-angle`,      theme.bgAngle  ?? 180);
  setTxt(`${pfx}-th-angle-v`, theme.bgAngle  ?? 180);
  set(`${pfx}-th-bg-solid`,   theme.bgSolid  || '#1a1a2e');
  set(`${pfx}-th-bg-solid-t`, theme.bgSolid  || '#1a1a2e');
  set(`${pfx}-th-bg-img`,     theme.bgImageUrl || '');
  if (theme.bgImageUrl) { const el = document.getElementById(`${pfx}-th-bg-img-prev`); if (el) el.textContent = '✔ uploaded'; }
  set(`${pfx}-th-bg-img-fit`, theme.bgImageFit || 'cover');
  set(`${pfx}-th-ovl`,        theme.bgOverlay ?? 50);
  setTxt(`${pfx}-th-ovl-v`,   theme.bgOverlay ?? 50);
  set(`${pfx}-th-font`,       theme.fontFamily || "'Segoe UI',Arial,sans-serif");
  set(`${pfx}-th-hfont`,      theme.headerFont || '');
  // backward-compat: old themes may have headerColor
  const tc = theme.textColor || theme.headerColor || '#ffffff';
  set(`${pfx}-th-tcol`,   tc);
  set(`${pfx}-th-tcol-t`, tc);
  set(`${pfx}-th-op`,         theme.tableOpacity ?? 13);
  setTxt(`${pfx}-th-op-v`,    theme.tableOpacity ?? 13);
  set(`${pfx}-th-rad`,        theme.tableRadius ?? 12);
  setTxt(`${pfx}-th-rad-v`,   theme.tableRadius ?? 12);
  setC(`${pfx}-th-blur`,      theme.tableBlur !== false);
  setC(`${pfx}-th-deco`,      theme.decoVisible !== false);
}


function schedDesignHTML(pfx, vals) {
  const sd = I18N[_lang] || I18N.en;
  const v = vals || {};
  const fontOpts = [
    ["'Noto Sans',sans-serif",       sd.sd_font_noto],
    ['Inter,sans-serif',             'Inter'],
    ['Roboto,sans-serif',            'Roboto'],
    ["'Open Sans',sans-serif",       'Open Sans'],
    ['Lato,sans-serif',              'Lato'],
    ['Montserrat,sans-serif',        'Montserrat'],
    ["'Segoe UI',Arial,sans-serif",  'Segoe UI (system)'],
  ];
  const fOpts = fontOpts.map(([val,lbl]) => `<option value="${val}">${lbl}</option>`).join('');
  const hFOpts = `<option value="">${sd.sd_same_as_table}</option>` + fontOpts.map(([val,lbl]) => `<option value="${val}">${lbl}</option>`).join('');
  return `
  <div class="design-section-label">${sd.sd_content}</div>
  <div class="form-row-2">
    <div class="form-group">
      <label>${sd.sd_rows_per_slide}</label>
      <input type="number" id="${pfx}-rows-slide" value="${v.rowsPerSlide||14}" min="5" max="20">
    </div>
    <div class="form-group">
      <label>${sd.sd_logo}</label>
      <input type="hidden" id="${pfx}-sched-logo" value="${esc(v.logoUrl||'')}">
      <div style="display:flex;align-items:center;gap:8px">
        <input type="file" accept="image/*" style="flex:1;font-size:12px" onchange="uploadSchedImg(this,'${pfx}-sched-logo','${pfx}-sched-logo-prev')">
        <span id="${pfx}-sched-logo-prev" style="font-size:11px;color:var(--muted)">${v.logoUrl ? sd.uploaded : ''}</span>
      </div>
    </div>
  </div>
  <div class="form-group">
    <label>${sd.sd_heading}</label>
    <input type="text" id="${pfx}-sched-title" value="${esc(v.title||'')}" maxlength="60">
  </div>
  <div class="form-group">
    <label>${sd.sd_school}</label>
    <input type="text" id="${pfx}-sched-school" value="${esc(v.schoolName||'')}" maxlength="80">
  </div>

  <div class="design-accordion" style="margin-top:4px">
    <div class="design-acc-head" style="cursor:default;pointer-events:none">
      <span>${sd.sd_appearance}</span>
    </div>
    <div class="design-acc-body" id="design-body-${pfx}" style="display:block">
      <div>
          <div class="design-section-label">${sd.sd_background}</div>
          <div class="form-group">
            <label>${sd.sd_bg_type}</label>
            <div class="seg-ctrl" id="${pfx}-bg-type-ctrl">
              <div class="seg-btn active" data-v="gradient" onclick="setBgType('${pfx}','gradient')">${sd.sd_gradient}</div>
              <div class="seg-btn"        data-v="solid"    onclick="setBgType('${pfx}','solid')">${sd.sd_solid}</div>
              <div class="seg-btn"        data-v="image"    onclick="setBgType('${pfx}','image')">${sd.sd_image}</div>
            </div>
          </div>
          <div id="${pfx}-bg-gradient">
            <div class="form-row-2">
              <div class="form-group"><label>${sd.sd_colour1}</label>
                <div class="color-row">
                  <input type="color" id="${pfx}-th-bg-from" value="#f4a63a" oninput="syncColor(this,'${pfx}-th-bg-from-t')">
                  <input type="text"  id="${pfx}-th-bg-from-t" value="#f4a63a" maxlength="25" oninput="syncColor(this,'${pfx}-th-bg-from')">
                </div></div>
              <div class="form-group"><label>${sd.sd_colour2}</label>
                <div class="color-row">
                  <input type="color" id="${pfx}-th-bg-to" value="#d84d00" oninput="syncColor(this,'${pfx}-th-bg-to-t')">
                  <input type="text"  id="${pfx}-th-bg-to-t" value="#d84d00" maxlength="25" oninput="syncColor(this,'${pfx}-th-bg-to')">
                </div></div>
            </div>
            <div class="form-group"><label>Angle: <span id="${pfx}-th-angle-v">180</span>°</label>
              <input type="range" id="${pfx}-th-angle" min="0" max="360" value="180" oninput="document.getElementById('${pfx}-th-angle-v').textContent=this.value">
            </div>
          </div>
          <div id="${pfx}-bg-solid" style="display:none">
            <div class="form-group"><label>${sd.sd_bg_colour}</label>
              <div class="color-row">
                <input type="color" id="${pfx}-th-bg-solid" value="#1a1a2e" oninput="syncColor(this,'${pfx}-th-bg-solid-t')">
                <input type="text"  id="${pfx}-th-bg-solid-t" value="#1a1a2e" maxlength="25" oninput="syncColor(this,'${pfx}-th-bg-solid')">
              </div></div>
          </div>
          <div id="${pfx}-bg-image" style="display:none">
            <div class="form-group"><label>${sd.sd_bg_image}</label>
              <input type="hidden" id="${pfx}-th-bg-img">
              <div style="display:flex;align-items:center;gap:8px">
                <input type="file" accept="image/*" style="flex:1;font-size:12px" onchange="uploadSchedImg(this,'${pfx}-th-bg-img','${pfx}-th-bg-img-prev')">
                <span id="${pfx}-th-bg-img-prev" style="font-size:11px;color:var(--muted)"></span>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group"><label>${sd.sd_fit_mode}</label>
                <select id="${pfx}-th-bg-img-fit" onchange="updateSchedPreview('${pfx}')">
                  <option value="cover">${sd.sd_cover}</option><option value="contain">${sd.sd_contain}</option>
                </select></div>
              <div class="form-group"><label>Overlay: <span id="${pfx}-th-ovl-v">50</span>%</label>
                <input type="range" id="${pfx}-th-ovl" min="0" max="90" value="50" oninput="document.getElementById('${pfx}-th-ovl-v').textContent=this.value">
              </div>
            </div>
          </div>

          <div class="design-section-label">${sd.sd_typography}</div>
          <div class="form-row-2">
            <div class="form-group"><label>${sd.sd_font_table}</label>
              <select id="${pfx}-th-font" onchange="updateSchedPreview('${pfx}')">${fOpts}</select></div>
            <div class="form-group"><label>${sd.sd_font_header}</label>
              <select id="${pfx}-th-hfont" onchange="updateSchedPreview('${pfx}')">${hFOpts}</select></div>
          </div>
          <div class="form-group"><label>${sd.sd_text_colour}</label>
            <div class="color-row">
              <input type="color" id="${pfx}-th-tcol" value="#ffffff" oninput="syncColor(this,'${pfx}-th-tcol-t')">
              <input type="text"  id="${pfx}-th-tcol-t" value="#ffffff" maxlength="25" oninput="syncColor(this,'${pfx}-th-tcol')">
            </div>
            <div class="form-hint">${sd.sd_text_hint}</div>
          </div>

          <div class="design-section-label">${sd.sd_table}</div>
          <div class="form-row-2">
            <div class="form-group"><label>Opacity: <span id="${pfx}-th-op-v">13</span>%</label>
              <input type="range" id="${pfx}-th-op" min="0" max="60" value="13" oninput="document.getElementById('${pfx}-th-op-v').textContent=this.value"></div>
            <div class="form-group"><label>Radius: <span id="${pfx}-th-rad-v">12</span>px</label>
              <input type="range" id="${pfx}-th-rad" min="0" max="32" value="12" oninput="document.getElementById('${pfx}-th-rad-v').textContent=this.value"></div>
          </div>
          <div class="form-row-2">
            <div class="form-group"><label class="check-label"><input type="checkbox" id="${pfx}-th-blur" checked onchange="updateSchedPreview('${pfx}')"> ${sd.sd_glassmorphism}</label></div>
            <div class="form-group"><label class="check-label"><input type="checkbox" id="${pfx}-th-deco" checked onchange="updateSchedPreview('${pfx}')"> ${sd.sd_deco}</label></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Confirm dialog ────────────────────────────────────────────────────

let confirmCb = null;

function confirm2(msg, okLabel, cb) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-ok').textContent  = okLabel || 'Delete';
  document.getElementById('confirm-overlay').classList.add('open');
  confirmCb = cb;
}

function closeConfirm(ok) {
  document.getElementById('confirm-overlay').classList.remove('open');
  if (ok && confirmCb) confirmCb();
  confirmCb = null;
}

// ── Toast ─────────────────────────────────────────────────────────────

function toast(msg, type = 'info') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${esc(msg)}</span>`;
  document.getElementById('toasts').appendChild(el);
  const rm = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
  setTimeout(rm, 3500);
  el.addEventListener('click', rm);
}

// ── Utilities ─────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function extractYtId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?#\n]+)/);
  return m ? m[1] : null;
}

// ── Keyboard & backdrop ───────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closePrev(); closeEditItem(); closeGroupModal(); closeChangePassword(); closeConfirm(false);
});

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target !== o) return;
    closePrev(); closeEditItem(); closeGroupModal(); closeChangePassword();
    if (o.id === 'confirm-overlay') closeConfirm(false);
  });
});

// ── Init ──────────────────────────────────────────────────────────────
applyLang(_lang);
loadDashboard();
