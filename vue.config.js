const path = require("path");
require("toml-require").install();
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const aliases = {
  cmp: "src/comps",
  frm: "src/comps/framework",
  stl: "src/styles",
  v: "src/views",
  core: "src/core",
  rs: "src/assets/resources",
  svg: "src/assets/svg",
  root: "./",
};

const registerAliases = (a, conf) =>
  Object.entries(a).forEach(([k, v]) =>
    conf.resolve.alias.set(`@${k}`, path.join(__dirname, v))
  );

const loadToml = (conf) => {
  const rule = conf.module.rule("toml");
  rule.uses.clear();
  rule
    .test(/\.toml$/)
    .use("toml")
    .loader("toml-loader")
    .end();
};

const loadSvg = (conf) => {
  const rule = conf.module.rule("svg");
  rule.uses.clear();
  rule
    .test(/\.svg$/)
    .use("svg")
    .loader("vue-svg-loader")
    .end();
};

const loadI18n = (conf) => {
  const rule = conf.module.rule("i18n");
  rule
    .resourceQuery(/blockType=i18n/)
    .type("javascript/auto")
    .use("i18n")
    .loader("@intlify/vue-i18n-loader")
    .end()
    .use("yaml")
    .loader("yaml-loader")
    .end();
};

const loadYaml = (conf) => {
  const rule = conf.module.rule("yml");
  rule.uses.clear();
  rule
    .test(/\.yml$/)
    .use("yml")
    .loader("js-yaml-loader")
    .end();
};

module.exports = {
  transpileDependencies: [
    "@hydre/shimio",
    "@hydre/shimio-graphql",
    "@hydre/graphql-batch-executor",
  ],
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new ImageminPlugin({ disable: process.env.NODE_ENV !== "production" }),
    ],
  },
  chainWebpack: (conf) => {
    registerAliases(aliases, conf);
    loadI18n(conf);
    loadToml(conf);
    loadSvg(conf);
    loadYaml(conf);
  },
};
