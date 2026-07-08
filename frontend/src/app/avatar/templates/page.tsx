import { Metadata } from 'next';
import { TemplateGalleryClient } from '@/components/avatar/TemplateGalleryClient';

export const metadata: Metadata = {
  title: 'AI Avatar Templates - Eromify',
  description: 'Browse and select base AI models for your avatars.',
};

export default function TemplateGalleryPage() {
  return <TemplateGalleryClient />;
}
