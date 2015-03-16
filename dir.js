module.exports = {
    ui         : './ui',
    assets     : './ui/assets',
    scss       : './ui/*/*.scss',
    script     : ['./ui/*/*.js', '!./ui/assets/*.js'],

    jade2watch : './ui/*/*.jade',

    release    : 'http://localhost:1024/E/ui/',

    build: {
        combo : 'build/E/1.0.0',
        ui    : 'build/E/ui/',
        biz   : 'build/E/biz/1.0.0/',
        base  : 'build/E/base/1.0.0'
    }
};
