import { SetMetadata } from '@nestjs/common';

export const BYPASS_AUTH = 'BYPASS_AUTH';
export const BypassAuth = () => SetMetadata(BYPASS_AUTH, true);
