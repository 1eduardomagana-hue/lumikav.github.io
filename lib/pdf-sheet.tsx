import React from 'react';
import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import type { AdvisorInfo, ImageAnalysis, LocationInsight, MarketingCopy, PropertyFields, UploadedImage } from './types';

const C = { green:'#12372a', deep:'#071f1a', gold:'#c9a45c', cream:'#f7f1e6', muted:'#6b706d', border:'#e2ddd6', white:'#ffffff' };

const s = StyleSheet.create({
  page:{ backgroundColor:C.white, fontFamily:'Helvetica', fontSize:10, color:C.deep },
  // Header
  header:{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', padding:'18 28 12 28', borderBottom:`1 solid ${C.border}` },
  hTitle:{ fontFamily:'Times-Roman', fontSize:20, color:C.deep, maxWidth:320, lineHeight:1.1 },
  hLocation:{ fontSize:9.5, color:C.muted, marginTop:3 },
  hType:{ fontSize:9, color:C.muted, marginTop:2 },
  hRight:{ alignItems:'flex-end' },
  hPrice:{ fontFamily:'Times-Roman', fontSize:16, color:C.green },
  hBadge:{ backgroundColor:C.green, color:C.white, fontSize:7.5, fontFamily:'Helvetica-Bold', letterSpacing:1.2, padding:'2 7', borderRadius:99, marginTop:4 },
  hId:{ fontSize:8, color:C.muted, marginTop:3, letterSpacing:.4 },
  // Gallery
  gallery:{ flexDirection:'row', gap:2, margin:'10 28 0 28', height:170 },
  mgCover:{ flex:1.45, borderRadius:2, overflow:'hidden', position:'relative' },
  mgRight:{ flex:1, flexDirection:'column', gap:2 },
  mgSec:{ flex:1, borderRadius:2, overflow:'hidden', position:'relative' },
  imgFull:{ width:'100%', height:'100%', objectFit:'cover' },
  placeholder:{ backgroundColor:C.cream, flex:1, borderRadius:2 },
  // Caption overlay (approximated in PDF — placed below image)
  capWrap:{ marginTop:3 },
  capTitle:{ fontFamily:'Helvetica-Bold', fontSize:8.5, color:C.deep },
  capText:{ fontSize:7.5, color:C.muted, marginTop:1, lineHeight:1.35 },
  // Metrics
  metrics:{ flexDirection:'row', margin:'10 28 0 28', border:`1 solid ${C.border}`, borderRadius:2 },
  metric:{ flex:1, padding:'7 8', borderRight:`1 solid ${C.border}`, alignItems:'center' },
  metricLast:{ borderRight:'none' },
  mVal:{ fontFamily:'Helvetica-Bold', fontSize:12, color:C.deep },
  mLbl:{ fontSize:7, color:C.muted, letterSpacing:1, textTransform:'uppercase', marginTop:2 },
  // Content
  cols:{ flexDirection:'row', gap:16, margin:'12 28 0 28' },
  colL:{ flex:1.1 },
  colR:{ flex:.9 },
  secLabel:{ fontSize:7.5, color:C.muted, letterSpacing:2, textTransform:'uppercase', marginBottom:6, fontFamily:'Helvetica-Bold' },
  desc:{ fontSize:10.5, lineHeight:1.65, color:'#2a3230' },
  descP:{ marginBottom:6 },
  lifestyle:{ fontSize:10, lineHeight:1.6, color:C.green, paddingLeft:8, borderLeft:`2 solid ${C.gold}`, marginTop:8 },
  // Location
  locationBox:{ backgroundColor:C.cream, padding:'9 11', marginTop:10, borderRadius:2, borderLeft:`2 solid ${C.gold}` },
  locCatName:{ fontSize:7.5, fontFamily:'Helvetica-Bold', letterSpacing:1, textTransform:'uppercase', color:C.muted, marginBottom:3 },
  locItem:{ fontSize:9.5, color:C.deep, lineHeight:1.5 },
  locDot:{ color:C.gold, marginRight:3 },
  // Amenities
  pills:{ flexDirection:'row', flexWrap:'wrap', gap:4 },
  pill:{ fontSize:8.5, color:C.green, border:`1 solid ${C.gold}`, padding:'2 8', borderRadius:99 },
  // Highlights
  hlBox:{ backgroundColor:C.deep, padding:'11 13', borderRadius:2, marginTop:11 },
  hlLabel:{ fontSize:7.5, color:C.gold, letterSpacing:2, textTransform:'uppercase', marginBottom:7, fontFamily:'Helvetica-Bold' },
  hlItem:{ flexDirection:'row', gap:6, marginBottom:3, alignItems:'flex-start' },
  hlDot:{ width:3.5, height:3.5, borderRadius:2, backgroundColor:C.gold, marginTop:4 },
  hlText:{ fontSize:9.5, color:'rgba(255,255,255,0.88)', flex:1, lineHeight:1.5 },
  // Advisor
  advisor:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderTop:`2 solid ${C.gold}`, backgroundColor:C.cream, padding:'12 28', marginTop:'auto' },
  advName:{ fontFamily:'Times-Roman', fontSize:14, color:C.deep, marginBottom:2 },
  advMeta:{ fontSize:9, color:C.muted, lineHeight:1.65 },
  advCta:{ fontSize:8, color:C.gold, letterSpacing:1.5, textTransform:'uppercase', marginTop:4, fontFamily:'Helvetica-Bold' },
  advValue:{ fontSize:8.5, color:C.muted, fontStyle:'italic', marginTop:2 },
  advLogo:{ maxWidth:66, maxHeight:38, objectFit:'contain' },
  // Footer
  footer:{ flexDirection:'row', justifyContent:'space-between', backgroundColor:C.deep, padding:'5 28' },
  footerText:{ fontSize:7.5, color:'rgba(255,255,255,0.3)', letterSpacing:1 },
  // Gallery page
  gpHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', padding:'16 28 10 28', borderBottom:`1 solid ${C.border}` },
  gpTitle:{ fontFamily:'Times-Roman', fontSize:13, color:C.deep },
  gpGrid2:{ flexDirection:'row', flexWrap:'wrap', gap:10, padding:'12 28', flex:1 },
  gpGrid4:{ flexDirection:'row', flexWrap:'wrap', gap:8, padding:'12 28', flex:1 },
  gpItem2:{ width:'47%' },
  gpItem4:{ width:'47%', marginBottom:8 },
  gpImg2:{ width:'100%', height:160, borderRadius:2 },
  gpImg4:{ width:'100%', height:110, borderRadius:2 },
  gpCapTitle:{ fontFamily:'Helvetica-Bold', fontSize:9, color:C.deep, marginTop:5 },
  gpCapText:{ fontSize:8, color:C.muted, marginTop:2, lineHeight:1.4 },
  gpBullet:{ fontSize:7.5, color:C.green, marginTop:2 },
});

const LABELS = {
  es:{ bedrooms:'Recámaras', bathrooms:'Baños', halfBaths:'Medios baños', parking:'Estacionamientos', builtArea:'Construcción', lotArea:'Terreno', maintenance:'Mantenimiento', propertyId:'ID', description:'Descripción', amenities:'Amenidades', highlights:'Beneficios clave', photos:'Galería', page:'Página', preparedBy:'Preparado por', location:'Ubicación estratégica', valueSentence:'Ficha preparada para presentar, compartir y facilitar la decisión de compra.' },
  en:{ bedrooms:'Bedrooms', bathrooms:'Bathrooms', halfBaths:'Half baths', parking:'Parking', builtArea:'Built area', lotArea:'Lot size', maintenance:'Maintenance', propertyId:'ID', description:'Description', amenities:'Amenities', highlights:'Key benefits', photos:'Gallery', page:'Page', preparedBy:'Prepared by', location:'Strategic Location', valueSentence:'Prepared to present, share and support better real estate decisions.' },
};

type Lang = 'es' | 'en';
interface Props { lang:Lang; fields:PropertyFields; copy:MarketingCopy; advisor:AdvisorInfo; images:UploadedImage[] }

function has(s?:string){ return (s??'').trim().length > 0; }

function getCaption(img:UploadedImage, lang:Lang):{title:string;text:string}|null {
  if (!img.analysis) return null;
  const title = lang==='es' ? img.analysis.captionTitleEs : img.analysis.captionTitleEn;
  const text  = lang==='es' ? img.analysis.captionEs      : img.analysis.captionEn;
  if (!title && !text) return null;
  return { title:(title||'').trim(), text:(text||'').trim() };
}

function getSellingPoints(img:UploadedImage, lang:Lang):string[] {
  if (!img.analysis) return [];
  return (lang==='es' ? img.analysis.sellingPointsEs : img.analysis.sellingPointsEn) || [];
}

type MKey = 'bedrooms'|'bathrooms'|'halfBaths'|'parking'|'builtArea'|'lotArea'|'maintenance';

export function PropertySheet({ lang, fields, copy, advisor, images }:Props) {
  const lbl = LABELS[lang];
  const isEs = lang==='es';

  const cover     = images.find(i=>i.role==='cover') ?? images[0];
  const secondary = images.filter(i=>i!==cover).slice(0,2);
  const extra     = images.filter(i=>i!==cover && !secondary.includes(i));

  const title  = (fields.title||'').trim() || (isEs?'Propiedad destacada':'Featured property');
  const price  = (fields.price||'').trim() || (isEs?'Precio bajo solicitud':'Price on request');
  const opType = (fields.operationType||'').trim() || (isEs?'EN VENTA':'FOR SALE');

  const metricDefs:{key:MKey;label:string}[] = [
    {key:'bedrooms',label:lbl.bedrooms},{key:'bathrooms',label:lbl.bathrooms},
    {key:'halfBaths',label:lbl.halfBaths},{key:'parking',label:lbl.parking},
    {key:'builtArea',label:lbl.builtArea},{key:'lotArea',label:lbl.lotArea},
    {key:'maintenance',label:lbl.maintenance},
  ];
  const metrics = metricDefs.filter(m=>has(fields[m.key]));

  const descParts = (copy.description||'').split(/\n+/).map(p=>p.trim()).filter(Boolean).slice(0,4);
  const locationInsights:LocationInsight[] = copy.locationInsights ?? [];
  const valueSentence = (copy.valueSentence||'').trim() || lbl.valueSentence;

  const perPage = extra.length <= 4 ? 2 : 4;
  const extraChunks:UploadedImage[][] = [];
  for (let i=0;i<extra.length;i+=perPage) extraChunks.push(extra.slice(i,i+perPage));

  return (
    <Document title={title}>
      <Page size="A4" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          <View>
            <Text style={s.hTitle}>{title}</Text>
            {has(fields.location) && <Text style={s.hLocation}>{fields.location}</Text>}
            {has(fields.propertyType) && <Text style={s.hType}>{fields.propertyType}</Text>}
          </View>
          <View style={s.hRight}>
            <Text style={s.hPrice}>{price}</Text>
            <Text style={s.hBadge}>{opType}</Text>
            {has(fields.propertyId) && <Text style={s.hId}>{lbl.propertyId}: {fields.propertyId}</Text>}
          </View>
        </View>

        {/* GALLERY */}
        {images.length > 0 && (
          <View style={s.gallery}>
            <View style={s.mgCover}>
              {cover ? <Image src={cover.dataUrl} style={s.imgFull}/> : <View style={s.placeholder}/>}
            </View>
            <View style={s.mgRight}>
              {[secondary[0], secondary[1]].map((img, idx) => (
                <View key={idx} style={s.mgSec}>
                  {img ? <Image src={img.dataUrl} style={s.imgFull}/> : <View style={s.placeholder}/>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* GALLERY CAPTIONS row */}
        {images.length > 0 && (cover || secondary[0] || secondary[1]) && (
          <View style={{ flexDirection:'row', gap:2, margin:'3 28 0 28' }}>
            {cover && (() => { const c=getCaption(cover,lang); return c ? <View style={{ flex:1.45 }}><Text style={s.capTitle}>{c.title}</Text></View> : <View style={{ flex:1.45 }}/>; })()}
            {secondary[0] && (() => { const c=getCaption(secondary[0],lang); return c ? <View style={{ flex:.5 }}><Text style={s.capTitle}>{c.title}</Text></View> : <View style={{ flex:.5 }}/>; })()}
            {secondary[1] && (() => { const c=getCaption(secondary[1],lang); return c ? <View style={{ flex:.5 }}><Text style={s.capTitle}>{c.title}</Text></View> : <View style={{ flex:.5 }}/>; })()}
          </View>
        )}

        {/* METRICS */}
        {metrics.length > 0 && (
          <View style={s.metrics}>
            {metrics.map((m,idx) => (
              <View key={m.key} style={[s.metric, idx===metrics.length-1?s.metricLast:{}]}>
                <Text style={s.mVal}>{fields[m.key]}</Text>
                <Text style={s.mLbl}>{m.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CONTENT */}
        <View style={s.cols}>
          <View style={s.colL}>
            <Text style={s.secLabel}>{lbl.description}</Text>
            <View style={s.desc}>
              {descParts.map((p,i) => <Text key={i} style={i<descParts.length-1?s.descP:{}}>{p}</Text>)}
            </View>
            {has(copy.lifestyle) && <Text style={s.lifestyle}>{copy.lifestyle}</Text>}
            {locationInsights.length > 0 && (
              <View style={s.locationBox}>
                <Text style={[s.secLabel,{marginBottom:5}]}>{lbl.location}</Text>
                {locationInsights.map((loc,i) => (
                  <Text key={i} style={s.locItem}>· {loc.name}{loc.distanceText ? ` – ${loc.distanceText}` : ''}</Text>
                ))}
              </View>
            )}
          </View>
          <View style={s.colR}>
            {copy.amenities?.length > 0 && (
              <>
                <Text style={s.secLabel}>{lbl.amenities}</Text>
                <View style={s.pills}>
                  {copy.amenities.slice(0,14).map((a,i) => <Text key={i} style={s.pill}>{a}</Text>)}
                </View>
              </>
            )}
            {copy.highlights?.length > 0 && (
              <View style={s.hlBox}>
                <Text style={s.hlLabel}>{lbl.highlights}</Text>
                {copy.highlights.slice(0,6).map((h,i) => (
                  <View key={i} style={s.hlItem}><View style={s.hlDot}/><Text style={s.hlText}>{h}</Text></View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ADVISOR */}
        <View style={s.advisor}>
          <View>
            <Text style={s.advName}>{advisor.name||''}</Text>
            <Text style={s.advMeta}>
              {[advisor.position,advisor.company].filter(has).join(' · ')}
              {has(advisor.phone)?`\n${advisor.phone}`:''}
              {has(advisor.email)?`  ·  ${advisor.email}`:''}
              {has(advisor.whatsapp)?`\nWhatsApp ${advisor.whatsapp}`:''}
              {has(advisor.website)?`  ·  ${advisor.website.replace(/^https?:\/\//,'')}`:''}
            </Text>
            <Text style={s.advCta}>{copy.cta||(isEs?'Agende una visita privada':'Schedule a private viewing')}</Text>
            <Text style={s.advValue}>{valueSentence}</Text>
          </View>
          {has(advisor.logo) && <Image src={advisor.logo!} style={s.advLogo}/>}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>LumiKav Brochure Studio</Text>
          <Text style={s.footerText}>{lbl.page} 1</Text>
        </View>
      </Page>

      {/* GALLERY PAGES */}
      {extraChunks.map((chunk,pageIdx) => {
        const large = perPage===2;
        return (
          <Page key={pageIdx} size="A4" style={s.page}>
            <View style={s.gpHeader}>
              <Text style={s.gpTitle}>{title}</Text>
              <Text style={[s.secLabel,{marginBottom:0}]}>{lbl.photos}</Text>
            </View>
            <View style={large ? s.gpGrid2 : s.gpGrid4}>
              {chunk.map((img,i) => {
                const cap = getCaption(img,lang);
                const pts = getSellingPoints(img,lang).slice(0,3);
                return (
                  <View key={i} style={large ? s.gpItem2 : s.gpItem4}>
                    <Image src={img.dataUrl} style={large ? s.gpImg2 : s.gpImg4}/>
                    {cap && <Text style={s.gpCapTitle}>{cap.title}</Text>}
                    {cap && <Text style={s.gpCapText}>{cap.text}</Text>}
                    {pts.map((pt,j) => <Text key={j} style={s.gpBullet}>· {pt}</Text>)}
                  </View>
                );
              })}
            </View>
            <View style={s.footer}>
              <Text style={s.footerText}>LumiKav Brochure Studio</Text>
              <Text style={s.footerText}>{lbl.page} {pageIdx+2}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
