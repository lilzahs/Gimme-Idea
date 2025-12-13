'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IdeaDetail } from '../../../components/IdeaDetail';
import { useAppStore } from '../../../lib/store';
import { extractIdFromSlug } from '../../../lib/slug-utils';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedProject, setSelectedProject, fetchProjectById, isLoading } = useAppStore();
  const slugOrId = params.id as string;
  
  // Extract ID prefix from slug (e.g., "my-idea-abc12345" -> "abc12345")
  // Or use full value if it's already a UUID
  const ideaId = extractIdFromSlug(slugOrId) || slugOrId;

  useEffect(() => {
    if (ideaId) {
      // Clear old project immediately to prevent showing wrong data
      setSelectedProject(null);

      // Fetch the project by slug/ID and set it as selected
      fetchProjectById(ideaId).then((project) => {
        if (project) {
          setSelectedProject(project);
        } else {
          // If project not found, redirect to ideas page
          router.push('/idea');
        }
      }).catch(() => {
        router.push('/idea');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  // Show loading spinner until project is loaded
  if (isLoading || !ideaId || !selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <IdeaDetail />;
}
