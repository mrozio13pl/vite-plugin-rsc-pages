export { default as rsc } from '@/virtual/rsc';
export { resolveElementForRequest } from 'virtual:rsc-pages/routes';

import { RedirectError } from '@/virtual/shared';

export function redirect(location: string, status = 307) {
    throw new RedirectError(location, status);
}
