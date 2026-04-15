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

        // Landing Photo extracting for SEO
        let landingPhotoUrl = null;
        if (Array.isArray(inv.landing_photo) && inv.landing_photo.length > 0) {
          landingPhotoUrl = inv.landing_photo[0];
        } else if (typeof inv.landing_photo === 'string' && inv.landing_photo.trim() !== '') {
          // It might be a JSON string if the backend didn't cast it
          try {
            const parsed = JSON.parse(inv.landing_photo);
            if (Array.isArray(parsed) && parsed.length > 0) landingPhotoUrl = parsed[0];
          } catch(e) {
            landingPhotoUrl = inv.landing_photo;
          }
        }

        // Resolving URL
        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://app.digitvitation.my.id/storage';
        if (landingPhotoUrl && !landingPhotoUrl.startsWith('http')) {
          // If it lacks a leading slash, the backend usually stores 'images/...', append it properly
          landingPhotoUrl = landingPhotoUrl.startsWith('/') 
            ? `${storageUrl}${landingPhotoUrl}`
            : `${storageUrl}/${landingPhotoUrl}`;
        }

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: landingPhotoUrl ? [{ url: landingPhotoUrl }] : [],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: landingPhotoUrl ? [landingPhotoUrl] : [],
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
