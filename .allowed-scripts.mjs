import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // Needed by jest for running tests in watch mode
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Native solution to quickly resolve module paths, used by jest and eslint
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.6': 'ALLOW',
  },
})
