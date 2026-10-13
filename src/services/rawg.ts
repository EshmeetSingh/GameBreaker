export type RawgMetadata = {
  description?: string;
  developer?: string;
  genres?: string[];
};

export async function getRawgMetadata(
  title: string,
  store: string,
): Promise<RawgMetadata | undefined> {
    const params = new URLSearchParams({title: title, store: store});
    const response = await fetch(`/api/rawg?${params}`);

    if (response.status === 404){
      return undefined;
    }

    if(!response.ok){
        throw new Error("Failed to fetch RAWG Metadata.");
    }

    const data = await response.json();
    return data;
}
