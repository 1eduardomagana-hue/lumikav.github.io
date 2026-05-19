import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { AdvisorInfo, Language, MarketingCopy, PropertyFields, TemplateId, UploadedImage } from './types';

const colors = {
  green: '#12372a', deep: '#071f1a', gold: '#c9a45c',
  cream: '#f7f1e6', charcoal: '#1f2523', muted: '#6b706d'
};

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', color: colors.charcoal, fontFamily: 'Helvetica', padding: 28 },
  hero: { height: 260, position: 'relative', marginBottom: 18, backgroundColor: colors.cream },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', left: 22, right: 22, bottom: 20, padding: 18, backgroundColor: 'rgba(7,31,26,0.84)' },
  eyebrow: { color: colors.gold, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  headline: { color: '#ffffff', fontFamily: 'Times-Roman', fontSize: 28, lineHeight: 1.05 },
  subheadline: { color: colors.cream, fontSize: 11, marginTop: 8, lineHeight: 1.3 },
  row: { flexDirection: 'row', gap: 14 },
  mainCol: { width: '62%' },
  sideCol: { width: '38%' },
  sectionTitle: { color: colors.green, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  body: { fontSize: 10.5, lineHeight: 1.45, color: colors.charcoal },
  lifestyle: { fontSize: 11, lineHeight: 1.45, color: colors.green, marginTop: 10, paddingLeft: 10, borderLeft: `2px solid ${colors.gold}` },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  fact: { width: '48%', padding: 8, backgroundColor: colors.cream },
  factLabel: { fontSize: 6.8, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 },
  factValue: { fontSize: 10.5, color: colors.deep },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 7, border: `1px solid ${colors.gold}` },
  iconDot: { width: 5, height: 5, borderRadius: 5, backgroundColor: colors.gold },
  pillText: { fontSize: 8.5, color: colors.green },
  gallery: { flexDirection: 'row', gap: 7, marginTop: 13 },
  thumb: { width: '50%', height: 84, objectFit: 'cover', backgroundColor: colors.cream },
  highlights: { marginTop: 14, padding: 12, backgroundColor: colors.deep },
  highlightItem: { color: '#ffffff', fontSize: 9.5, lineHeight: 1.6 },
  advisor: { marginTop: 16, borderTop: `1px solid ${colors.gold}`, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  advisorName: { fontSize: 13, color: colors.deep, fontFamily: 'Times-Roman' },
  advisorMeta: { fontSize: 8.5, color: colors.muted, lineHeight: 1.4 },
  logo: { maxWidth: 72, maxHeight: 42, objectFit: 'contain' },
  cta: { color: colors.gold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.1, marginTop: 5 },
  technicalHeader: { backgroundColor: colors.deep, color: '#ffffff', padding: 22, marginBottom: 18 },
  techHeadline: { fontFamily: 'Times-Roman', fontSize: 25, color: '#ffffff' },
  techGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTop: `1px solid ${colors.cream}`, borderLeft: `1px solid ${colors.cream}` },
  techCell: { width: '50%', padding: 10, borderRight: `1px solid ${colors.cream}`, borderBottom: `1px solid ${colors.cream}` },
  techImage: { height: 150, objectFit: 'cover', marginBottom: 14 },
  footer: { position: 'absolute', bottom: 18, left: 28, right: 28, color: colors.muted, fontSize: 7, textAlign: 'center' }
});

const labels: Record<Language, Record<keyof PropertyFields, string>> = {
  es: { title: 'Propiedad', propertyType: 'Tipo', location: 'Ubicación', price: 'Precio', bedrooms: 'Habitaciones', bathrooms: 'Baños', builtArea: 'Área construida', lotArea: 'Terreno', parking: 'Parking', yearBuilt: 'Año', status: 'Estado' },
  en: { title: 'Property', propertyType: 'Type', location: 'Location', price: 'Price', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', builtArea: 'Built area', lotArea: 'Lot size', parking: 'Parking', yearBuilt: 'Year built', status: 'Status' }
};

function factEntries(fields: PropertyFields) {
  return (Object.entries(fields) as [keyof PropertyFields, string][]).filter(([key, value]) => key !== 'title' && Boolean(value)).slice(0, 8);
}

interface PdfProps {
  language: Language;
  fields: PropertyFields;
  copy: MarketingCopy;
  advisor: AdvisorInfo;
  images: UploadedImage[];
}

function AdvisorBlock({ advisor, cta }: { advisor: AdvisorInfo; cta: string }) {
  return (
    <View style={styles.advisor}>
      <View>
        <Text style={styles.advisorName}>{advisor.name}</Text>
        <Text style={styles.advisorMeta}>{advisor.position} · {advisor.company}</Text>
        <Text style={styles.advisorMeta}>{advisor.phone} · {advisor.email}</Text>
        <Text style={styles.advisorMeta}>WhatsApp {advisor.whatsapp} · {advisor.website}</Text>
        <Text style={styles.cta}>{cta}</Text>
      </View>
      {advisor.logo ? <Image src={advisor.logo} style={styles.logo} /> : null}
    </View>
  );
}

function PremiumBrochure({ language, fields, copy, advisor, images }: PdfProps) {
  const cover = images.find((img) => img.role === 'cover') ?? images[0];
  const gallery = images.filter((img) => img.id !== cover?.id).slice(0, 2);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.hero}>
        {cover ? <Image src={cover.dataUrl} style={styles.heroImage} /> : null}
        <View style={styles.heroOverlay}>
          <Text style={styles.eyebrow}>{fields.location || (language === 'es' ? 'Propiedad destacada' : 'Featured property')}</Text>
          <Text style={styles.headline}>{copy.headline}</Text>
          <Text style={styles.subheadline}>{copy.subheadline}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.mainCol}>
          <Text style={styles.sectionTitle}>{language === 'es' ? 'Presentación' : 'Overview'}</Text>
          <Text style={styles.body}>{copy.description}</Text>
          <Text style={styles.lifestyle}>{copy.lifestyle}</Text>
          <View style={styles.gallery}>
            {gallery.map((img) => <Image key={img.id} src={img.dataUrl} style={styles.thumb} />)}
          </View>
          <View style={styles.highlights}>
            <Text style={[styles.sectionTitle, { color: colors.gold }]}>{language === 'es' ? 'Beneficios clave' : 'Key advantages'}</Text>
            {copy.highlights.slice(0, 5).map((item) => <Text key={item} style={styles.highlightItem}>• {item}</Text>)}
          </View>
        </View>
        <View style={styles.sideCol}>
          <Text style={styles.sectionTitle}>{language === 'es' ? 'Datos principales' : 'Key facts'}</Text>
          <View style={styles.facts}>
            {factEntries(fields).map(([key, value]) => (
              <View key={key} style={styles.fact}>
                <Text style={styles.factLabel}>{labels[language][key]}</Text>
                <Text style={styles.factValue}>{value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>{language === 'es' ? 'Amenidades' : 'Amenities'}</Text>
          <View style={styles.pills}>
            {copy.amenities.slice(0, 8).map((item) => (
              <View key={item} style={styles.pill}>
                <View style={styles.iconDot} />
                <Text style={styles.pillText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <AdvisorBlock advisor={advisor} cta={copy.cta} />
      <Text style={styles.footer}>Generated by LumiKav Brochure Studio</Text>
    </Page>
  );
}

function TechnicalSheet({ language, fields, copy, advisor, images }: PdfProps) {
  const cover = images.find((img) => img.role === 'cover') ?? images[0];
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.technicalHeader}>
        <Text style={styles.eyebrow}>{language === 'es' ? 'Ficha técnica inmobiliaria' : 'Real estate technical sheet'}</Text>
        <Text style={styles.techHeadline}>{fields.title || copy.headline}</Text>
        <Text style={styles.subheadline}>{copy.subheadline}</Text>
      </View>
      {cover ? <Image src={cover.dataUrl} style={styles.techImage} /> : null}
      <Text style={styles.sectionTitle}>{language === 'es' ? 'Resumen ejecutivo' : 'Executive summary'}</Text>
      <Text style={styles.body}>{copy.description}</Text>
      <Text style={styles.lifestyle}>{copy.lifestyle}</Text>
      <View style={{ marginTop: 18 }}>
        <Text style={styles.sectionTitle}>{language === 'es' ? 'Especificaciones' : 'Specifications'}</Text>
        <View style={styles.techGrid}>
          {factEntries(fields).map(([key, value]) => (
            <View key={key} style={styles.techCell}>
              <Text style={styles.factLabel}>{labels[language][key]}</Text>
              <Text style={styles.factValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ marginTop: 18 }}>
        <Text style={styles.sectionTitle}>{language === 'es' ? 'Amenidades y diferenciales' : 'Amenities and differentiators'}</Text>
        {[...copy.amenities, ...copy.highlights].slice(0, 12).map((item) => <Text key={item} style={styles.body}>• {item}</Text>)}
      </View>
      <AdvisorBlock advisor={advisor} cta={copy.cta} />
      <Text style={styles.footer}>Generated by LumiKav Brochure Studio</Text>
    </Page>
  );
}

export function PropertyPdfDocument(props: PdfProps & { template: TemplateId }) {
  return (
    <Document title={`${props.fields.title || 'Property'} ${props.language.toUpperCase()}`}>
      {props.template === 'technical-sheet' ? <TechnicalSheet {...props} /> : <PremiumBrochure {...props} />}
    </Document>
  );
}
