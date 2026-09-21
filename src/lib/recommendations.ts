import { supabase } from './supabase';
import type { Product } from '../data/products';

interface RecommendationProfile {
  skin_type?: string | null;
  concerns?: string[];
}

export async function recommendProducts(customerId: string | null, products: Product[]) {
  const [{ data: profile }, { data: rules }] = await Promise.all([
    customerId ? supabase.from('profiles').select('skin_profile').eq('id', customerId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('recommendation_rules').select('rule_name, trigger_skin_type, target_category_id, weight_modifier').eq('is_active', true).order('weight_modifier', { ascending: false }),
  ]);
  const customer = (profile || {}) as RecommendationProfile;
  const activeRules = rules || [];
  const scored = products.map(product => {
    let score = product.rating * 10;
    const reasons: string[] = [];
    const text = `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
    for (const rule of activeRules as any[]) {
      const triggers = rule.trigger_skin_type || [];
      const profileValues = [customer.skin_type, ...(customer.concerns || [])].filter(Boolean).map(value => String(value).toLowerCase());
      if (triggers.some((trigger: string) => profileValues.includes(trigger.toLowerCase()))) {
        score += Number(rule.weight_modifier) * 10; reasons.push('Matches your beauty profile');
      }
      if (rule.target_category_id && text.includes(String(rule.target_category_id).toLowerCase())) score += Number(rule.weight_modifier) * 5;
      if (product.stock > 0) score += Number(rule.weight_modifier);
    }
    if (product.rating >= 4.5) reasons.push('Highly rated by customers');
    return { product, score, reason: reasons[0] || 'A strong match based on rating and availability' };
  }).sort((a, b) => b.score - a.score);

  return scored;
}
