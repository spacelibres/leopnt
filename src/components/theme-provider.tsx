'use client';
import {createContext,useContext,useEffect,useState,type CSSProperties} from 'react';
import {usePathname} from 'next/navigation';
import {Palette,Check} from 'lucide-react';
import presets from '../../public/brand/palette-tokens.json';

const labels=['电光蓝','极光薄荷','星云紫','太阳橙','深空青','未来青柠'];
const ThemeContext=createContext({palette:presets[0],dark:false,setPalette:(_index:number)=>{},toggleDark:()=>{}});
export const useTheme=()=>useContext(ThemeContext);
export const themeAsset=(name:string,file:string)=>`/brand/${name}/${file}.svg`;

export function ThemeProvider({children}:{children:React.ReactNode}){
  const [index,setIndex]=useState(0),[dark,setDark]=useState(false);
  const pathname=usePathname();
  const palette=presets[index];
  useEffect(()=>{try{
    const saved=Number(localStorage.getItem('LEOPNT-palette')??0);
    if(Number.isInteger(saved)&&saved>=0&&saved<presets.length)setIndex(saved);
    setDark(localStorage.getItem('LEOPNT-appearance')==='dark');
  }catch{}},[]);
  useEffect(()=>{
    const icon=document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const isDark=dark||!['/','/technology'].includes(pathname);
    if(icon)icon.href=themeAsset(palette.name,`icon-on-${isDark?'dark':'light'}`);
  },[palette,dark,pathname]);
  const setPalette=(next:number)=>{if(next<0||next>=presets.length)return;setIndex(next);try{localStorage.setItem('LEOPNT-palette',String(next));}catch{}};
  const toggleDark=()=>setDark(value=>{try{localStorage.setItem('LEOPNT-appearance',value?'light':'dark');}catch{}return !value;});
  const style=Object.fromEntries(Object.entries(palette.colors).map(([key,value])=>[`--${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`,value])) as CSSProperties;
  return <ThemeContext.Provider value={{palette,dark,setPalette,toggleDark}}><div className="vi-root" style={style} data-vi-palette={palette.name} data-vi-appearance={dark?'dark':'light'}>{children}</div></ThemeContext.Provider>;
}

export function PalettePicker(){
  const {palette,setPalette}=useTheme();
  return <details className="vi-palette-menu"><summary aria-label="选择网站配色"><Palette size={18}/><span>配色</span></summary><div className="vi-palette-panel"><strong>属于你的低轨视野</strong><p>六种色彩，同一片天空。</p><div className="vi-palette-options">{presets.map((item,index)=><button key={item.name} aria-label={`切换${labels[index]}配色`} aria-pressed={palette.name===item.name} onClick={()=>setPalette(index)}><span className="palette-sample" style={{background:`linear-gradient(135deg,${item.colors.primary} 0 45%,${item.colors.secondary} 45% 75%,${item.colors.accent} 75%)`}}/>{labels[index]}{palette.name===item.name&&<Check size={14}/>}</button>)}</div></div></details>;
}

export function OrbitArtwork({className}:{className:string}){
  const {palette}=useTheme();
  return <img className={`vi-orbit-art ${className}`} src={themeAsset(palette.name,'orbit-flow')} alt="" aria-hidden="true"/>;
}
