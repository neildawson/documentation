module.exports = [
  {
    type: 'category',
    label: 'Core service',
    link: {
      type: 'generated-index',
      title: 'Core service',
      slug: '/category/api/rest/core/core-service'
    },
    items: [
      {
        type: 'doc',
        id: 'api/rest/core/core-service-last-block-height',
        label: 'Blockchain height',
        className: 'api-method get'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-statistics',
        label: 'Statistics',
        className: 'api-method get'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-get-vega-time',
        label: 'Vega time',
        className: 'api-method get'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-submit-transaction',
        label: 'Submit Transaction',
        className: 'api-method post'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-check-transaction',
        label: 'Check transaction',
        className: 'api-method post'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-submit-raw-transaction',
        label: 'Submit raw transaction',
        className: 'api-method post'
      },
      {
        type: 'doc',
        id: 'api/rest/core/core-service-check-raw-transaction',
        label: 'Check raw transaction',
        className: 'api-method post'
      }
    ]
  }
]
