import { Documentation } from '@/components/information';
import {pageMetadata} from '@/lib/site';
export const metadata = pageMetadata('/docs','开发者文档');
export default function Page() { return <Documentation/>; }
