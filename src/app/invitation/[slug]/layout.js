export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const to = resolvedSearchParams?.to || '';

  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.digitvitation.my.id/api';
  let url = `${apiUrl}/public-invitation/${slug}`;
  if (to) {
      url += `?to=${encodeURIComponent(to)}`;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.invitation) {
        const inv = json.data.invitation;
        
        let guestNameText = '';
        if (to) {
           const guestName = to.replace(/-/g, ' ');
           guestNameText = `Kepada Yth: ${guestName} - `;
        }

        const title = `${guestNameText}${inv.groom_name} & ${inv.bride_name} | Wedding Invitation`;
        const description = inv.description || 'Anda diundang ke acara pernikahan kami!';

        // Cover Photo extracting
        let coverPhotoUrl = null;
        if (Array.isArray(inv.cover_photo) && inv.cover_photo.length > 0) {
          coverPhotoUrl = inv.cover_photo[0];
        } else if (typeof inv.cover_photo === 'string' && inv.cover_photo.trim() !== '') {
          // It might be a JSON string if the backend didn't cast it
          try {
            const parsed = JSON.parse(inv.cover_photo);
            if (Array.isArray(parsed) && parsed.length > 0) coverPhotoUrl = parsed[0];
          } catch(e) {
            coverPhotoUrl = inv.cover_photo;
          }
        }

        // Resolving URL
        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage';
        if (coverPhotoUrl && !coverPhotoUrl.startsWith('http')) {
          // If it lacks a leading slash, the backend usually stores 'images/...', append it properly
          coverPhotoUrl = coverPhotoUrl.startsWith('/') 
            ? `${storageUrl}${coverPhotoUrl}`
            : `${storageUrl}/${coverPhotoUrl}`;
        }

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: coverPhotoUrl ? [{ url: coverPhotoUrl }] : [],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: coverPhotoUrl ? [coverPhotoUrl] : [],
          }
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch metadata for invitation:", error);
  }

  return {
    title: 'Wedding Invitation',
    description: 'Anda diundang ke acara pernikahan kami!',
  };
}

export default function InvitationLayout({ children }) {
  return children;
}
