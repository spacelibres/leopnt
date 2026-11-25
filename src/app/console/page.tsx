import { Dashboard } from '@/components/dashboard';
import {pageMetadata} from '@/lib/site';
export const metadata = pageMetadata('/console','星座控制台');
export default function Console() { return <Dashboard consoleMode/>; }
