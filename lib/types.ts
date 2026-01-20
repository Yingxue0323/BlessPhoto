// 业务类型定义 - 主题、套餐、生成结果等
export interface BlessingTheme {
    id: string
    name: string
    nameEn: string
    icon: string
    description: string
    promptHint: string
  }
  
  export interface GenerationRequest {
    imageBase64: string
    theme: BlessingTheme
    blessingText: string
  }
  
  export interface GeneratedImage {
    base64?: string
    url?: string
    mediaType: string
  }
  
  export interface UserCredits {
    remaining: number
    total: number
    lastUpdated: string
  }
  
  export const BLESSING_THEMES: BlessingTheme[] = [
    {
      id: 'wedding',
      name: '婚礼祝福',
      nameEn: 'Wedding',
      icon: '💍',
      description: '为新人送上最美好的婚礼祝福',
      promptHint: 'wedding celebration, romantic, elegant, love'
    },
    {
      id: 'birthday',
      name: '生日祝福',
      nameEn: 'Birthday',
      icon: '🎂',
      description: '庆祝生命中的每一个特别时刻',
      promptHint: 'birthday celebration, festive, joyful, colorful balloons and cake'
    },
    {
      id: 'graduation',
      name: '毕业祝福',
      nameEn: 'Graduation',
      icon: '🎓',
      description: '祝贺学业有成，前程似锦',
      promptHint: 'graduation ceremony, academic achievement, cap and gown, proud moment'
    },
    {
      id: 'housewarming',
      name: '乔迁祝福',
      nameEn: 'Housewarming',
      icon: '🏠',
      description: '恭贺乔迁新居，幸福安康',
      promptHint: 'new home, housewarming, cozy, warm atmosphere, prosperity'
    },
    {
      id: 'pet-birthday',
      name: '宠物生日',
      nameEn: 'Pet Birthday',
      icon: '🐾',
      description: '为毛孩子庆祝特别的日子',
      promptHint: 'pet birthday, cute, adorable, party decorations, treats'
    },
    {
      id: 'greeting',
      name: '日常问候',
      nameEn: 'Daily Greeting',
      icon: '👋',
      description: '日常暖心问候，传递友情',
      promptHint: 'friendly greeting, warm, casual, cheerful, everyday kindness'
    },
    {
      id: 'new-year',
      name: '新年祝福',
      nameEn: 'New Year',
      icon: '🎆',
      description: '辞旧迎新，万事如意',
      promptHint: 'new year celebration, fireworks, festive, auspicious, prosperity'
    },
    {
      id: 'thanksgiving',
      name: '感恩节',
      nameEn: 'Thanksgiving',
      icon: '🍂',
      description: '感恩有你，温暖相伴',
      promptHint: 'thanksgiving, gratitude, autumn colors, warm family gathering'
    }
  ]
  
  export const PRICING_PLANS = [
    {
      id: 'starter',
      name: '入门包',
      credits: 10,
      price: 5,
      pricePerImage: 0.5,
      popular: false
    },
    {
      id: 'popular',
      name: '超值包',
      credits: 25,
      price: 10,
      pricePerImage: 0.4,
      popular: true
    },
    {
      id: 'pro',
      name: '专业包',
      credits: 60,
      price: 20,
      pricePerImage: 0.33,
      popular: false
    }
  ]
  
  export const ENTERPRISE_PLAN = {
    name: '企业版',
    price: 99,
    period: '月',
    features: [
      '无限量图片生成',
      '优先处理队列',
      'API 接入',
      '批量处理支持',
      '专属客服支持',
      '自定义品牌水印'
    ]
  }
  