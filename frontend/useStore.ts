import { create } from 'zustand';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import axios from 'axios';
import { persist } from 'zustand/middleware';

interface StoreState {
  session: string | null;
  userID: string | null;
  email: string | null;
  customerID: string | null;
  isPaidUser: boolean;
  isLoading: boolean;
  lastFetchTime: number;
  fetchSessionAndUserStatus: () => Promise<void>;
  setSession: (session: string | null) => void;
}

const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

const useStore = create(
  persist<StoreState>(
    (set, get) => ({
      session: null,
      userID: null,
      email: null,
      customerID: null,
      isPaidUser: false,
      isLoading: false,
      lastFetchTime: 0,
      setSession: (session: string | null) => set({ session }),

      fetchSessionAndUserStatus: async () => {
        const currentState = get();
        const now = Date.now();

        // If we've fetched recently, don't fetch again
        if (currentState.session && now - currentState.lastFetchTime < FETCH_COOLDOWN) {
          return;
        }

        set({ isLoading: true });
        const supabase = createSupabaseBrowser();

        try {
          const { data, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          const userToken = data.session?.access_token;
          const userID = data.session?.user?.id;
          const userEmail = data.session?.user?.email;

          if (!userID || !userToken || !userEmail) {
            set({ 
              session: null, 
              userID: null, 
              email: null, 
              isPaidUser: false, 
              isLoading: false,
              lastFetchTime: now 
            });
            return;
          }

          // Only fetch subscription status if it's a new session or it's been a while
          if (!currentState.session || now - currentState.lastFetchTime >= FETCH_COOLDOWN) {
            // const subscriptionStatusResponse = await axios.get(
            //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/user-subscription-status`,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${userToken}`,
            //     },
            //     params: { user_id: userID },
            //   }
            // );

            const subscriptionStatus = 'active'; //subscriptionStatusResponse.data.status;
            const customerID = 'cus_P856666666666666666666666'; //subscriptionStatusResponse.data.customer_id;

            set({
              session: userToken,
              userID: userID,
              email: userEmail,
              isPaidUser: subscriptionStatus === 'active',
              customerID: customerID,
              isLoading: false,
              lastFetchTime: now,
            });
          } else {
            set({
              session: userToken,
              userID: userID,
              email: userEmail,
              isLoading: false,
              lastFetchTime: now,
            });
          }
        } catch (error) {
          console.error('An error occurred:', error);
          set({ 
            session: null, 
            userID: null, 
            email: null, 
            isPaidUser: false, 
            isLoading: false,
            lastFetchTime: now 
          });
        }
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        session: state.session,
        userID: state.userID,
        email: state.email,
        customerID: state.customerID,
        isPaidUser: state.isPaidUser,
        isLoading: state.isLoading,
        lastFetchTime: state.lastFetchTime,
        fetchSessionAndUserStatus: state.fetchSessionAndUserStatus,
        setSession: state.setSession,
      }),
    }
  )
);

export default useStore;