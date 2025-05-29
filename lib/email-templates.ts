export interface EmailTemplate {
  id: string
  name: string
  category: 'collaboration' | 'follow-up' | 'contract' | 'introduction'
  subject: string
  content: string
  variables: string[] // Variables that can be replaced like {influencerName}, {companyName}
}

export const emailTemplates: EmailTemplate[] = [
  // Collaboration Templates
  {
    id: 'collab-initial',
    name: 'Initial Collaboration Proposal',
    category: 'collaboration',
    subject: 'Partnership Opportunity with {companyName}',
    content: `Hi {influencerName},

I hope this email finds you well! I've been following your content on {platform} and I'm really impressed by your {niche} content and engaged audience.

I'm reaching out from {companyName} because I think there could be a great partnership opportunity between us. We specialize in {industry} and I believe our {product/service} would resonate well with your audience.

We're looking to collaborate with authentic creators like yourself who genuinely connect with their followers. I'd love to discuss how we can work together in a way that provides value to both your audience and our brand.

Would you be interested in a quick call this week to explore this further? I'm happy to work around your schedule.

Looking forward to hearing from you!

Best regards,
{yourName}
{yourTitle}
{companyName}
{contactInfo}`,
    variables: ['influencerName', 'companyName', 'platform', 'niche', 'industry', 'product/service', 'yourName', 'yourTitle', 'contactInfo']
  },
  {
    id: 'collab-product-seeding',
    name: 'Product Seeding Proposal',
    category: 'collaboration',
    subject: 'Would you like to try our {productName}?',
    content: `Hello {influencerName},

I've been admiring your {contentType} content, especially your recent post about {recentPost}. Your authentic approach to {niche} really stands out!

I'm {yourName} from {companyName}, and we've just launched our new {productName} that I think would be perfect for you and your audience.

We'd love to send you our {productName} to try out with no strings attached. If you love it and feel it's a good fit for your audience, we'd be thrilled if you shared your honest thoughts. If not, no worries at all!

Here's what makes our {productName} special:
• {feature1}
• {feature2}
• {feature3}

Would you be interested? I can have it shipped to you this week.

Best,
{yourName}
{companyName}`,
    variables: ['influencerName', 'contentType', 'recentPost', 'niche', 'yourName', 'companyName', 'productName', 'feature1', 'feature2', 'feature3']
  },

  // Follow-up Templates
  {
    id: 'followup-gentle',
    name: 'Gentle Follow-up',
    category: 'follow-up',
    subject: 'Following up on our partnership opportunity',
    content: `Hi {influencerName},

I hope you've been having a great week! I wanted to follow up on my previous email about a potential collaboration between you and {companyName}.

I know you're probably busy creating amazing content, so I wanted to make this as easy as possible for you. Here's a quick recap of what we discussed:

• {proposalSummary}
• Timeline: {timeline}
• Compensation: {compensation}

Would you have 10 minutes this week for a quick call to discuss this further? I'm flexible on timing and happy to work around your schedule.

No pressure at all - I just wanted to make sure my email didn't get lost in your inbox!

Best regards,
{yourName}
{companyName}`,
    variables: ['influencerName', 'companyName', 'proposalSummary', 'timeline', 'compensation', 'yourName']
  },
  {
    id: 'followup-value-add',
    name: 'Follow-up with Additional Value',
    category: 'follow-up',
    subject: 'Quick idea for our {campaignName} collaboration',
    content: `Hey {influencerName},

I was thinking more about our potential collaboration and had an idea I wanted to share with you.

In addition to what we discussed earlier, what if we also:
• {additionalOffer1}
• {additionalOffer2}
• {additionalOffer3}

I think this could make the partnership even more valuable for both you and your audience. We're really excited about the possibility of working together and want to make sure this is a win-win for everyone.

What are your thoughts? Would love to hear your feedback!

Talk soon,
{yourName}`,
    variables: ['influencerName', 'campaignName', 'additionalOffer1', 'additionalOffer2', 'additionalOffer3', 'yourName']
  },

  // Contract & Negotiation Templates
  {
    id: 'contract-terms',
    name: 'Contract Terms Discussion',
    category: 'contract',
    subject: 'Partnership Agreement Details - {campaignName}',
    content: `Hi {influencerName},

Great to hear you're interested in moving forward with our {campaignName} partnership! I'm excited to work together.

Let me outline the key terms we discussed:

**Campaign Details:**
• Campaign: {campaignName}
• Timeline: {timeline}
• Deliverables: {deliverables}
• Platform(s): {platforms}

**Compensation:**
• Fee: {fee}
• Payment terms: {paymentTerms}
• Additional perks: {additionalPerks}

**Content Guidelines:**
• {guideline1}
• {guideline2}
• {guideline3}

I'll have our legal team prepare the formal agreement based on these terms. In the meantime, please let me know if you have any questions or if you'd like to adjust anything.

Looking forward to creating something amazing together!

Best,
{yourName}
{yourTitle}
{companyName}`,
    variables: ['influencerName', 'campaignName', 'timeline', 'deliverables', 'platforms', 'fee', 'paymentTerms', 'additionalPerks', 'guideline1', 'guideline2', 'guideline3', 'yourName', 'yourTitle', 'companyName']
  },
  {
    id: 'contract-negotiation',
    name: 'Rate Negotiation',
    category: 'contract',
    subject: 'Re: Partnership rates for {campaignName}',
    content: `Hi {influencerName},

Thank you for your interest in our {campaignName} campaign and for sharing your rates.

I appreciate your transparency about pricing. While your rate of {theirRate} is higher than our initial budget of {ourBudget}, I can see the value you bring to the table.

Here's what I can offer:
• Base fee: {revisedOffer}
• Performance bonus: {performanceBonus}
• Additional perks: {additionalPerks}

This brings the total potential value to {totalValue}, which I believe reflects the quality of your work and audience engagement.

Would this work for you? I'm open to discussing this further if needed.

Best regards,
{yourName}
{companyName}`,
    variables: ['influencerName', 'campaignName', 'theirRate', 'ourBudget', 'revisedOffer', 'performanceBonus', 'additionalPerks', 'totalValue', 'yourName', 'companyName']
  },

  // Introduction Templates
  {
    id: 'intro-warm',
    name: 'Warm Introduction',
    category: 'introduction',
    subject: 'Introduction from {mutualConnection}',
    content: `Hi {influencerName},

I hope this email finds you well! {mutualConnection} suggested I reach out to you, as they thought we might have some great synergies.

I'm {yourName}, {yourTitle} at {companyName}. We work in the {industry} space and are always looking to partner with talented creators who share our values of {sharedValues}.

{mutualConnection} mentioned that you've been doing some amazing work in {niche}, and after checking out your content, I can see why they were so enthusiastic about introducing us!

I'd love to learn more about your current projects and see if there might be opportunities for us to collaborate. Would you be open to a brief call sometime this week?

Looking forward to connecting!

Best,
{yourName}
{yourTitle}
{companyName}`,
    variables: ['influencerName', 'mutualConnection', 'yourName', 'yourTitle', 'companyName', 'industry', 'sharedValues', 'niche']
  },
  {
    id: 'intro-cold',
    name: 'Cold Outreach Introduction',
    category: 'introduction',
    subject: 'Love your {recentContent} content!',
    content: `Hi {influencerName},

I just came across your {recentContent} post and had to reach out - it really resonated with me! Your take on {specificTopic} was spot on.

I'm {yourName} from {companyName}, and we're working on some exciting projects in the {industry} space. Given your expertise in {niche} and your engaged community, I think there could be some interesting collaboration opportunities.

We're not your typical brand - we really value authentic partnerships and believe in giving creators the creative freedom to tell stories in their own voice.

Would you be interested in a quick 15-minute call to explore how we might work together? I promise it'll be worth your time!

Best regards,
{yourName}
{companyName}
{website}`,
    variables: ['influencerName', 'recentContent', 'specificTopic', 'yourName', 'companyName', 'industry', 'niche', 'website']
  }
]

export const getTemplatesByCategory = (category: EmailTemplate['category']) => {
  return emailTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return emailTemplates.find(template => template.id === id)
}

export const replaceVariables = (content: string, variables: Record<string, string>) => {
  let result = content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g')
    result = result.replace(regex, value || `{${key}}`)
  })
  return result
}

export const extractVariables = (template: EmailTemplate) => {
  const variables = new Set<string>()
  const regex = /{([^}]+)}/g
  let match
  
  // Extract from subject
  while ((match = regex.exec(template.subject)) !== null) {
    variables.add(match[1])
  }
  
  // Reset regex lastIndex and extract from content
  regex.lastIndex = 0
  while ((match = regex.exec(template.content)) !== null) {
    variables.add(match[1])
  }
  
  return Array.from(variables)
} 