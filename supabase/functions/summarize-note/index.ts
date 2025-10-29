import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    if (!content || content.length < 50) {
      return new Response(
        JSON.stringify({ error: 'İçerik çok kısa, özetleme için en az 50 karakter gerekli' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Basit özetleme algoritması (gerçek AI servisi yerine)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const summary = sentences
      .slice(0, Math.min(3, Math.ceil(sentences.length / 3)))
      .join('. ')
      .trim() + (sentences.length > 3 ? '...' : '')

    return new Response(
      JSON.stringify({ 
        summary: summary || 'Özet oluşturulamadı',
        originalLength: content.length,
        summaryLength: summary.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Özetleme sırasında hata oluştu' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})