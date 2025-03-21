
// Add at the end of the file or in the appropriate place
export const getDeadlineById = async (id: number) => {
  const { data, error } = await supabase
    .from('prazos')
    .select('*, setor:setores(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};
