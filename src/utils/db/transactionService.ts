// Hapus import createClient di sini

export async function saveTransactionAndUpdateXP(supabase: any, userId: string, parsedData: any) {
    // 1. Simpan Transaksi ke Supabase
    const { error: txError } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            title: parsedData.title,
            amount: parsedData.amount,
            type: parsedData.type,
            category: parsedData.category,
            date: parsedData.date,
            is_auto_sync: parsedData.is_auto_sync || false 
        }]);

    if (txError) {
        console.error("DB Error (Transactions):", txError);
        throw new Error("Gagal menyimpan transaksi ke database.");
    }

    // 2. Ambil State Gamifikasi User Saat Ini
    const { data: gameState, error: fetchError } = await supabase
        .from('gamification_state')
        .select('*')
        .eq('user_id', userId)
        .single();

    let currentXp = gameState?.xp || 0;
    let currentLevel = gameState?.level || 1;

    // 3. Logika Gamifikasi: +50 XP per transaksi
    const XP_REWARD = 50;
    const XP_TO_LEVEL_UP = 200; 
    
    let newXp = currentXp + XP_REWARD;
    let newLevel = currentLevel;
    let isLevelUp = false;

    if (newXp >= XP_TO_LEVEL_UP) {
        newLevel += Math.floor(newXp / XP_TO_LEVEL_UP);
        newXp = newXp % XP_TO_LEVEL_UP; 
        isLevelUp = true;
    }

    // 4. Update atau Insert Gamification State
    if (gameState) {
        const { error: updateError } = await supabase
            .from('gamification_state')
            .update({ xp: newXp, level: newLevel })
            .eq('user_id', userId);
        if (updateError) throw new Error("Gagal mengupdate XP.");
    } else {
        const { error: insertError } = await supabase
            .from('gamification_state')
            .insert([{ user_id: userId, xp: newXp, level: newLevel }]);
        if (insertError) throw new Error("Gagal membuat state awal XP.");
    }

    return { success: true, addedXp: XP_REWARD, newXp, newLevel, isLevelUp };
}