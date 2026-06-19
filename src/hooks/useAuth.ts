import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { fetchCurrentUser } from '../services/authService';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, loginFailure, setLoading } from '../store/authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    const user = await fetchCurrentUser(idToken);
                    dispatch(loginSuccess(user));
                } catch {
                    dispatch(loginFailure());
                }
            } else {
                dispatch(setLoading(false));
            }
        });

        return () => unsubscribe();
    }, [dispatch]);
};