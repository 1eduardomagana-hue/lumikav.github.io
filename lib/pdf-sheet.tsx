import React from 'react';
import { Document, Page, StyleSheet, Text, View, Image } from '@react-pdf/renderer';
import type { AdvisorInfo, MarketingCopy, PropertyFields, UploadedImage } from './types';

const C = { green: '#12372a', deep: '#071f1a', gold: '#c9a45c', cream: '#f7f1e6', muted: '#6b706d', border: '#e2ddd6', white: '#ffffff' };

const s = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: 'Helvetica', fontSize: 10, color: C.deep },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20 28 14 28', borderBottom: `1 solid ${C.border}` },
  hTitle: { fontFamily: 'Times-Roman', fontSize: 22, color: C.deep, maxWidth: 340 },
  hLocation: { fontSize: 10, color: C.muted, marginTop: 4 },
  hType: { fontSize: 9, color: C.muted, marginTop: 2 },
  hRight: { alignItems: 'flex-end' },
  hPrice: { fontFamily: 'Times-Roman', fontSize: 18, color: C.green },
  hBadge: { backgroundColor: C.green, color: C.white, fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 1.2, padding: '3 8', borderRadius: 99, marginTop: 5 },
  hId: { fontSize: 8, color: C.muted, marginTop: 4 },
  // Gallery
  gallery: { flexDirection: 'row', gap: 3, margin: '10 28 0 28', height: 180 },
  imgCover: { flex: 1.4, borderRadius: 2 },
  imgRight: { flex: 1, flexDirection: 'column', gap: 3 },
  imgSec: { flex: 1, borderRadius: 2 },
  imgPlaceholder: { backgroundColor: C.cream, flex: 1, borderRadius: 2 },
  imgFull: { width: '100%', height: '100%', objectFit: 'cover' },
  // Metrics
  metrics: { flexDirection: 'row', margin: '10 28 0 28', border: `1 solid ${C.border}`, borderRadius: 2 },
  metric: { flex: 1, padding: '8 10', borderRight: `1 solid ${C.border}`, alignItems: 'center' },
  metricLast: { borderRight: 'none' },
  mVal: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: C.deep },
  mLbl: { fontSize: 7, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  // Content cols
  cols: { flexDirection: 'row', gap: 18, margin: '14 28 0 28' },
  colL: { flex: 1.1 },
  colR: { flex: 0.9 },
  secLabel: { fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7, fontFamily: 'Helvetica-Bold' },
  desc: { fontSize: 11, lineHeight: 1.65, color: '#2a3230' },
  lifestyle: { fontSize: 10.5, lineHeight: 1.6, color: C.green, paddingLeft: 9, borderLeft: `2 solid ${C.gold}`, marginTop: 9 },
  // Amenities
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  pill: { fontSize: 9.5, color: C.green, border: `1 solid ${C.gold}`, padding: '3 9', borderRadius: 99 },
  // Highlights
  hlBox: { backgroundColor: C.deep, padding: '12 14', borderRadius: 2, marginTop: 12 },
  hlLabel: { fontSize: 8, color: C.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Helvetica-Bold' },
  hlItem: { flexDirection: 'row', gap: 7, marginBottom: 4, alignItems: 'flex-start' },
  hlDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.gold, marginTop: 4 },
  hlText: { fontSize: 10, color: 'rgba(255,255,255,0.88)', flex: 1, lineHeight: 1.5 },
  // Advisor
  advisor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: '14 0 0 0', borderTop: `2 solid ${C.gold}`, backgroundColor: C.cream, padding: '14 28' },
  advName: { fontFamily: 'Times-Roman', fontSize: 15, color: C.deep, marginBottom: 3 },
  advMeta: { fontSize: 9.5, color: C.muted, lineHeight: 1.7 },
  advCta: { fontSize: 8.5, color: C.gold, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 5, fontFamily: 'Helvetica-Bold' },
  advLogo: { maxWidth: 70, maxHeight: 40, objectFit: 'contain' },
  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.deep, padding: '6 28' },
  footerText: { fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2 },
  // Gallery page
  galleryPage: { padding: '20 28' },
  gpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingBottom: 10, borderBottom: `1 solid ${C.border}` },
  gpTitle: { fontFamily: 'Times-Roman', fontSize: 14, color: C.deep },
  gpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gpImg: { width: '48.5%', aspectRatio: '4/3', borderRadius: 2 },
  gpImgFull: { width: '100%', height: '100%', objectFit: 'cover' },
});

const LABELS = {
  es: { bedrooms:'Recámaras', bathrooms:'Baños', halfBaths:'Medios baños', parking:'Estacionamientos', builtArea:'Construcción', lotArea:'Terreno', maintenance:'Mantenimiento', propertyId:'ID', description:'Descripción', amenities:'Amenidades', highlights:'Beneficios clave', photos:'Galería', page:'Página' },
  en: { bedrooms:'Bedrooms', bathrooms:'Bathrooms', halfBaths:'Half baths', parking:'Parking', builtArea:'Built area', lotArea:'Lot size', maintenance:'Maintenance', propertyId:'ID', description:'Description', amenities:'Amenities', highlights:'Key benefits', photos:'Gallery', page:'Page' },
};

type Lang = 'es' | 'en';
interface Props { lang: Lang; fields: PropertyFields; copy: MarketingCopy; advisor: AdvisorInfo; images: UploadedImage[] }

function has(s?: string) { return (s ?? '').trim().length > 0; }

type MetricKey = 'bedrooms' | 'bathrooms' | 'halfBaths' | 'parking' | 'builtArea' | 'lotArea' | 'maintenance';

export function PropertySheet({ lang, fields, copy, advisor, images }: Props) {
  const lbl = LABELS[lang];
  const cover = images.find(i => i.role === 'cover') ?? images[0];
  const secondary = images.filter(i => i !== cover).slice(0, 2);
  const extra = images.filter(i => i !== cover && !secondary.includes(i));

  const title = fields.title || (lang === 'es' ? 'Propiedad destacada' : 'Featured property');
  const price = fields.price || (lang === 'es' ? 'Precio bajo solicitud' : 'Price on request');
  const opType = fields.operationType || (lang === 'es' ? 'EN VENTA' : 'FOR SALE');

  const metricKeys: MetricKey[] = ['bedrooms', 'bathrooms', 'halfBaths', 'parking', 'builtArea', 'lotArea', 'maintenance'];
  const metrics = metricKeys.filter(k => has(fields[k]));

  const descParts = (copy.description || '').split(/\n+/).map(p => p.trim()).filter(Boolean).slice(0, 4);

  // Gallery pages — 4 per page
  const extraChunks: UploadedImage[][] = [];
  for (let i = 0; i < extra.length; i += 4) extraChunks.push(extra.slice(i, i + 4));

  return (
    <Document title={title}>
      {/* PAGE 1 */}
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
            <View style={s.imgCover}>
              {cover ? <Image src={cover.dataUrl} style={s.imgFull} /> : <View style={s.imgPlaceholder} />}
            </View>
            <View style={s.imgRight}>
              <View style={s.imgSec}>
                {secondary[0] ? <Image src={secondary[0].dataUrl} style={s.imgFull} /> : <View style={s.imgPlaceholder} />}
              </View>
              <View style={s.imgSec}>
                {secondary[1] ? <Image src={secondary[1].dataUrl} style={s.imgFull} /> : <View style={s.imgPlaceholder} />}
              </View>
            </View>
          </View>
        )}

        {/* METRICS */}
        {metrics.length > 0 && (
          <View style={s.metrics}>
            {metrics.map((k, idx) => (
              <View key={k} style={[s.metric, idx === metrics.length - 1 ? s.metricLast : {}]}>
                <Text style={s.mVal}>{fields[k]}</Text>
                <Text style={s.mLbl}>{lbl[k]}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CONTENT COLS */}
        <View style={s.cols}>
          {/* LEFT */}
          <View style={s.colL}>
            <Text style={s.secLabel}>{lbl.description}</Text>
            <View style={s.desc}>
              {descParts.map((p, i) => <Text key={i} style={{ marginBottom: i < descParts.length - 1 ? 7 : 0 }}>{p}</Text>)}
            </View>
            {has(copy.lifestyle) && <Text style={s.lifestyle}>{copy.lifestyle}</Text>}
          </View>

          {/* RIGHT */}
          <View style={s.colR}>
            {copy.amenities?.length > 0 && (
              <>
                <Text style={s.secLabel}>{lbl.amenities}</Text>
                <View style={s.pills}>
                  {copy.amenities.slice(0, 14).map((a, i) => <Text key={i} style={s.pill}>{a}</Text>)}
                </View>
              </>
            )}
            {copy.highlights?.length > 0 && (
              <View style={s.hlBox}>
                <Text style={s.hlLabel}>{lbl.highlights}</Text>
                {copy.highlights.slice(0, 6).map((h, i) => (
                  <View key={i} style={s.hlItem}>
                    <View style={s.hlDot} />
                    <Text style={s.hlText}>{h}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ADVISOR */}
        <View style={s.advisor}>
          <View>
            <Text style={s.advName}>{advisor.name}</Text>
            <Text style={s.advMeta}>
              {[advisor.position, advisor.company].filter(has).join(' · ')}
              {has(advisor.phone) ? `\n${advisor.phone}` : ''}
              {has(advisor.email) ? `  ·  ${advisor.email}` : ''}
              {has(advisor.whatsapp) ? `\nWhatsApp ${advisor.whatsapp}` : ''}
              {has(advisor.website) ? `  ·  ${advisor.website.replace(/^https?:\/\//, '')}` : ''}
            </Text>
            <Text style={s.advCta}>{copy.cta || (lang === 'es' ? 'Agende una visita privada' : 'Schedule a private viewing')}</Text>
          </View>
          {has(advisor.logo) && <Image src={advisor.logo!} style={s.advLogo} />}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>LumiKav Brochure Studio</Text>
          <Text style={s.footerText}>{lbl.page} 1</Text>
        </View>
      </Page>

      {/* GALLERY PAGES */}
      {extraChunks.map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={s.page}>
          <View style={s.galleryPage}>
            <View style={s.gpHeader}>
              <Text style={s.gpTitle}>{title}</Text>
              <Text style={[s.secLabel, { marginBottom: 0 }]}>{lbl.photos}</Text>
            </View>
            <View style={s.gpGrid}>
              {chunk.map((img, i) => (
                <View key={i} style={s.gpImg}>
                  <Image src={img.dataUrl} style={s.gpImgFull} />
                </View>
              ))}
            </View>
          </View>
          <View style={s.footer}>
            <Text style={s.footerText}>LumiKav Brochure Studio</Text>
            <Text style={s.footerText}>{lbl.page} {pageIdx + 2}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
