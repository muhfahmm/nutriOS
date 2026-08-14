

export function logoutUser(setUser) {
  try {
    if (typeof setUser === 'function') {

      setUser(null);
      console.log('Sesi user berhasil dibersihkan.');
      return { success: true };
    } else {
      console.warn('setUser bukan sebuah fungsi.');
      return { success: false, error: 'setUser_invalid' };
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat logout:', error);
    return { success: false, error };
  }
}
