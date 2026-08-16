import BaselineSample from './App'
import MummaPrototype from './MummaPrototype'

export default function PrototypeRouter() {
  return window.location.hash.startsWith('#/prototypes/mumma-current')
    ? <MummaPrototype />
    : <BaselineSample />
}
