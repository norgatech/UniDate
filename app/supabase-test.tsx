
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
    const [status, setStatus] = useState('Connecting...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function testConnection() {
            const { data, error } = await supabase
                .from('universities')
                .select('id, name')
                .limit(1);

            if (error) {
                setStatus(`Database error: ${error.message}`);
            } else {
                setStatus(
                    `Connected successfully! Universities found: ${data.length}`
                );
            }

            setLoading(false);
        }

        testConnection();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            {loading && <ActivityIndicator size="large" />}
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 15 }}>
                UniDate Supabase Test
            </Text>
            <Text style={{ marginTop: 15, textAlign: 'center' }}>
                {status}
            </Text>
        </View>
    );
}

