/** @type {import('@docusaurus/types').DocusaurusConfig} */

// This is required at runtime currently due to the way redocusaurus is configured
// to fetch the swagger files. This will change in future to grab them in build.sh
// and rely on local copies, allowing us to remove this variable
let vega_version = process.env.VEGA_VERSION;
if (vega_version === undefined || vega_version === "") {
  console.log("Please specify env var VEGA_VERSION.");
  process.exit(1);
}

module.exports = {
  title: "Vega",
  tagline:
    "A protocol for creating and trading derivatives on a fully decentralised network",
  url: "https://docs.vega.xyz/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "vegaprotocol",
  projectName: "documentation",
  themeConfig: {
    image: "img/logo-y.png",
    navbar: {
      title: "Vega documentation",
      logo: {
        alt: "Vega Protocol Logo",
        src: "img/logo-y.png",
      },
      items: [
        {
          href: "https://github.com/vegaprotocol/documentation",
          label: "GitHub",
          position: "right",
        },
        {
          to: "/docs/concepts/new-to-vega",
          label: "Concepts",
          position: "left",
        },
        {
          to: "/docs/api/overview",
          label: "API",
          position: "left",
        },
        {
          to: "/docs/tools/",
          label: "Apps and Tools",
          position: "left",
        },
        {
          to: "/docs/releases/overview",
          label: "Releases",
          position: "left",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Vega Protocol",
          items: [
            {
              label: "Website",
              to: "http://vega.xyz/",
            },
            {
              label: "GitHub",
              to: "https://github.com/vegaprotocol",
            },
            {
              label: "Blog",
              to: "https://blog.vega.xyz",
            },
            {
              label: "Twitch",
              to: "https://www.twitch.tv/vegaprotocol",
            },
            {
              label: "YouTube",
              to: "https://www.youtube.com/vegaprotocol",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              to: "https://vega.xyz/discord",
            },
            {
              label: "Twitter",
              to: "https://twitter.com/vegaprotocol",
            },
            {
              label: "Forum",
              to: "https://community.vega.xyz/",
            },
            {
              label: "Telegram",
              to: "https://t.me/vegacommunity",
            },
          ],
        },
        {
          title: "Fairground",
          items: [
            {
              label: "Home",
              to: "https://fairground.wtf/",
            },
            {
              label: "Docs",
              to: "https://docs.fairground.vega.xyz/",
            },
            {
              label: "Vega Console",
              to: "https://console.fairground.wtf/",
            },
          ],
        },
      ],
      copyright: `Copyright ©2018-${new Date().getFullYear()} Gobalsky Labs Limited, registered in Gibraltar`,
    },
  },
  plugins: [
    [
      // This plugin extends the CLI to give us a generator that takes in our schema and produces
      // markdown files inside the docs folder, so these are included in the versioned docs.
      require.resolve("@edno/docusaurus2-graphql-doc-generator"),
      {
        // https://github.com/edno/graphql-markdown#options
        loaders: {
          UrlLoader: "@graphql-tools/url-loader",
        },
        schema: "./schema.graphql",
        rootPath: "docs",
        baseURL: "graphql",
        linkRoot: "/docs",
        diffMethod: "SCHEMA-DIFF",
      },
    ],
    [
      // An alternative to algolia
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        language: ["en"],
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: ["/docs"],
      },
    ],
    [
      // docusaurus-protobuffet as a preset is the standard approach. However, we want the GRPC docs to be
      // versioned along with the ./docs/ folder, so here we are using the plugin for it's file generation
      // portion only. The *plugin* extends the docusaurus CLI to give us `generate-grpc`, but does not 
      // set up another instance of `docs` that controls rendering for the GRPC portion of the docs. Which
      // is to say: GRPC is treated like any other part of our docs.
      // 
      // The weird thing this causes is that the React components in ProtoFile are provided by the theme, which
      // is no long available - so that component has been 'swizzled' out of the theme and in to ./src/theme
      require.resolve("docusaurus-protobuffet-plugin"),
      {
        routeBasePath: '/docs/grpc',
        fileDescriptorsPath: "./proto.json",
        protoDocsPath: "./docs/grpc",
        sidebarPath: "./docs/grpc/sidebar.js",
     }
    ],
  ],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        debug: undefined,
        // We don't have a '/blog/' section on the site, so disable this section
        blog: false, 
        // Configuration for the '/docs/' section of the site
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/vegaprotocol/documentation/edit/main/",
        },
        // Vega specific theme overrides go here
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
    [
      // REST - see note at the top. Currently this is not versioned inside docs, but can be
      "redocusaurus",
      {
        specs: [
          {
            spec:
              "https://raw.githubusercontent.com/vegaprotocol/protos/" +
              vega_version +
              "/swagger/data-node/api/v1/trading_data.swagger.json",
            route: "/docs/api/rest/data-node/data",
          },
          {
            spec:
              "https://raw.githubusercontent.com/vegaprotocol/protos/" +
              vega_version +
              "/swagger/vega/api/v1/core.swagger.json",
            route: "/docs/api/rest/core/core",
          },
          {
            spec:
              "https://raw.githubusercontent.com/vegaprotocol/protos/" +
              vega_version +
              "/swagger/vega/api/v1/corestate.swagger.json",
            route: "/docs/api/rest/core/state",
          },
        ],
      },
    ],
  ],
  themes: ["@saucelabs/theme-github-codeblock"],
};
