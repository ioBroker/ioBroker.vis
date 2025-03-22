const makeShared = pkgs => {
    const result = {};
    pkgs.forEach(packageName => {
        result[packageName] = {
            requiredVersion: '*',
            singleton: true,
        };
    });
    return result;
};
/**
 * Admin shares these modules for all components
 *
 * @param packageJson - package.json or list of modules that used in component
 * @return Object with shared modules for "federation"
 */
export const moduleFederationShared = packageJson => {
    const list = [
        '@iobroker/adapter-react-v5',
        '@iobroker/adapter-react-v5/i18n/de.json',
        '@iobroker/adapter-react-v5/i18n/en.json',
        '@iobroker/adapter-react-v5/i18n/es.json',
        '@iobroker/adapter-react-v5/i18n/ru.json',
        '@iobroker/adapter-react-v5/i18n/nl.json',
        '@iobroker/adapter-react-v5/i18n/it.json',
        '@iobroker/adapter-react-v5/i18n/pl.json',
        '@iobroker/adapter-react-v5/i18n/pt.json',
        '@iobroker/adapter-react-v5/i18n/fr.json',
        '@iobroker/adapter-react-v5/i18n/uk.json',
        '@iobroker/adapter-react-v5/i18n/zh-cn.json',
        '@iobroker/vis-2-widgets-react-dev',
        '@mui/icons-material',
        '@mui/material',
        '@mui/styles',
        '@mui/system',
        'prop-types',
        'react',
        'react-ace',
        'react-dom',
        'react-dom/client',
    ];
    if (Array.isArray(packageJson)) {
        return makeShared(list.filter(packageName => packageJson.includes(packageName)));
    }
    if (packageJson && (packageJson.dependencies || packageJson.devDependencies)) {
        return makeShared(
            list.filter(
                packageName => packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName],
            ),
        );
    }
    return makeShared(list);
};
//# sourceMappingURL=modulefederation.admin.config.js.map

