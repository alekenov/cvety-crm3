<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

if (!function_exists('load_vue_app')) {
    /**
     * @param array $arFiles - массив подгружаемых файлов, отсортированных в порядке подключения.
     * @param string $appName - название папки с приложением.
     * @param string $templateFolder - путь от корня сайта до папки с приложением.
     */
    function load_vue_app($arFiles, $appName, $templateFolder)
    {
        $templates = [
            'css' => '<link href="#path#?v=#v#" rel="stylesheet">',
            'js' => '<script src="#path#?v=#v#"></script>',
        ];

        foreach ($arFiles as $name) {
            $ext = end(explode('.', $name));
            $path = "{$templateFolder}/{$appName}/dist/{$ext}/$name";
            $fullPath = "{$_SERVER['DOCUMENT_ROOT']}{$path}";
            $v = filemtime($fullPath);

            $template = $templates[$ext];
            $html = str_replace('#path#', $path, $template);
            $html = str_replace('#v#', $v, $html);
            echo $html;
        }
    }
}
\Bitrix\Main\Ui\Extension::load(['clipboard']);
$arFiles = [
    'app.css',
    'app.js',
];
if(isset($arParams['showV2'])):
?>

    <div class="crm-cv">
        <div class="crm-cv__header">
            <div class="container">
                <div class="crm-cv__header-title">Товары</div>
            </div>
        </div>
        <div class="crm-cv__body container"><div id="app"></div>  </div>
    </div>
<?else:?>
    <div id="app"></div>
<?endif?>
<script>
    window.jsParams = <?=json_encode($arResult, JSON_UNESCAPED_UNICODE)?>;
</script>
<?load_vue_app($arFiles, 'vue_app', $templateFolder);?>