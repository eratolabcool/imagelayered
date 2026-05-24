export type SeoMarket = 'en' | 'pt' | 'ja' | 'ru' | 'es';

export type ImageLayeredSeoPage = {
  market: SeoMarket;
  lang: string;
  slug: string;
  title: string;
  description: string;
  keyword: string;
  eyebrow: string;
  h1: string;
  intro: string;
  pain: string;
  solution: string;
  workflowTitle: string;
  workflow: string[];
  useCasesTitle: string;
  useCases: string[];
  promptsTitle: string;
  prompts: string[];
  faq: { q: string; a: string }[];
  cta: string;
};

export const seoMarketLabels: Record<SeoMarket, string> = {
  en: 'English',
  pt: 'Portugues',
  ja: '日本語',
  ru: 'Русский',
  es: 'Espanol',
};

export const imageLayeredSeoPages: ImageLayeredSeoPage[] = [
  {
    market: 'en',
    lang: 'en',
    slug: 'edit-ai-image-without-regenerating',
    title: 'Edit AI Images Without Regenerating | Image Layered',
    description:
      'Edit one part of an AI image while keeping the face, product, layout, lighting, and composition intact. Split the image into layers and revise only what needs to change.',
    keyword: 'edit AI image without regenerating',
    eyebrow: 'AI image post-editing',
    h1: 'Edit AI images without starting over',
    intro:
      'The expensive part of AI image work is not generation. It is revision. Image Layered turns a finished image into editable layers so you can change one object, background, outfit, label, or text block without throwing away the image that already works.',
    pain:
      'Regenerating often changes the face, pose, product shape, lighting, camera angle, and overall composition. Users need controlled edits, not another random variation.',
    solution:
      'Upload an image, separate it into layers, select the part that needs work, and describe the change. The rest of the image stays available as visual context for a more predictable edit.',
    workflowTitle: 'Recommended workflow',
    workflow: [
      'Upload the final JPG, PNG, or WEBP image.',
      'Use AI layer separation to split subject, product, text, background, and shadow.',
      'Select the exact layer that needs revision.',
      'Edit, extract, download, or recombine the result.',
    ],
    useCasesTitle: 'Best for',
    useCases: [
      'AI creators who need final revisions after Midjourney, Flux, or GPT Image.',
      'Marketers who want to preserve an approved ad layout.',
      'Designers who need local edits without rebuilding the whole artwork.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Change only the jacket to black satin, keep the face and pose identical.',
      'Remove the object on the right and reconstruct the background naturally.',
      'Replace the headline with Summer Drop while keeping the poster style.',
    ],
    faq: [
      {
        q: 'Is this another AI image generator?',
        a: 'No. Image Layered is focused on post-editing: the workflow after you already have a good image and only need controlled changes.',
      },
      {
        q: 'Can it keep the same composition?',
        a: 'Layer-based editing is designed to reduce unwanted changes because you can isolate the element that should change and preserve the rest as context.',
      },
    ],
    cta: 'Upload an image',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'edit-ai-product-photos',
    title: 'Edit AI Product Photos Without Distorting Products | Image Layered',
    description:
      'Revise AI product photos by separating product, background, shadow, props, and text into layers. Change the scene while protecting the product.',
    keyword: 'edit AI product photos',
    eyebrow: 'Product photo revision',
    h1: 'Edit AI product photos without changing the product',
    intro:
      'Product photos need consistency. If the bottle, label, shoe, or package changes during editing, the image becomes unusable. Image Layered helps protect the sellable object while you revise the background, props, lighting, or text.',
    pain:
      'Simple background removers can make a product float, while full AI regeneration may alter proportions, labels, materials, or brand details.',
    solution:
      'Separate product, background, shadow, props, and copy into layers. Edit the environment while keeping the product layer intact.',
    workflowTitle: 'Product editing workflow',
    workflow: [
      'Upload the product image.',
      'Create 4 to 7 layers for product, shadow, label, props, and background.',
      'Select the background or prop layer.',
      'Generate a clean commerce-ready result.',
    ],
    useCasesTitle: 'Commerce use cases',
    useCases: [
      'White-background images for marketplaces.',
      'Premium lifestyle scenes for cosmetics, perfume, fashion, and accessories.',
      'Seasonal ad variations for Shopify, Amazon, Etsy, and social ads.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Replace the background with a clean white studio and soft natural shadow.',
      'Create a premium marble scene while keeping the product identical.',
      'Remove the surrounding props and keep only the product and shadow.',
    ],
    faq: [
      {
        q: 'Will the product stay the same?',
        a: 'The safest workflow is to keep the product as its own layer and edit only the environment layers around it.',
      },
      {
        q: 'Is this useful for ecommerce teams?',
        a: 'Yes. It is designed for repeatable product revisions: background swaps, shadow cleanup, text changes, and campaign variations.',
      },
    ],
    cta: 'Edit a product photo',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'change-background-of-ai-product-image',
    title: 'Change Background of AI Product Image | Image Layered',
    description:
      'Change the background of an AI product image while preserving the product, label, perspective, and shadow.',
    keyword: 'change background of AI product image',
    eyebrow: 'Background swap for product images',
    h1: 'Change the background of an AI product image',
    intro:
      'A product image can be almost perfect except for the scene around it. Image Layered gives you a layer-first workflow for changing the background while preserving the item that matters.',
    pain:
      'Regenerating the full image can change the actual product. Removing the background alone often loses realistic shadow and depth.',
    solution:
      'Split the image into product, shadow, background, and supporting elements. Then edit the background layer while recombining everything into one final image.',
    workflowTitle: 'How it works',
    workflow: [
      'Upload the product image.',
      'Separate product, shadow, and background into independent layers.',
      'Select the background layer.',
      'Describe the new studio, lifestyle, or seasonal scene.',
    ],
    useCasesTitle: 'Common backgrounds',
    useCases: [
      'Minimal white studio.',
      'Luxury marble or glass table.',
      'Holiday, Black Friday, summer, or launch campaign scenes.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Change the background to a clean white studio with soft contact shadow.',
      'Replace the scene with a warm kitchen counter and natural morning light.',
      'Create a high-end cosmetic campaign background with subtle reflections.',
    ],
    faq: [
      {
        q: 'Can I keep the original shadow?',
        a: 'Yes. When shadow is separated into its own layer, you can preserve, edit, or recombine it with the new background.',
      },
      {
        q: 'Can I export the product separately?',
        a: 'Yes. The editor supports extracting and downloading individual layers for downstream design work.',
      },
    ],
    cta: 'Change product background',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'modify-midjourney-image',
    title: 'Modify Midjourney Images Without Losing Composition | Image Layered',
    description:
      'Revise Midjourney images by changing clothing, background, objects, text, and lighting without rerolling the whole scene.',
    keyword: 'modify Midjourney image',
    eyebrow: 'Midjourney post-editing',
    h1: 'Modify a Midjourney image without losing the composition',
    intro:
      'Midjourney can produce a beautiful base image, but final delivery often requires small corrections. Image Layered helps you keep the winning image and revise only the part that is wrong.',
    pain:
      'A reroll can lose the expression, framing, palette, and mood that made the image good. That is frustrating when the requested change is small.',
    solution:
      'Convert the Midjourney output into editable layers, choose the faulty element, and make a local AI edit.',
    workflowTitle: 'Revision workflow',
    workflow: [
      'Export your Midjourney image.',
      'Upload it to Image Layered.',
      'Separate subject, background, text, and props.',
      'Edit the selected layer and recombine the result.',
    ],
    useCasesTitle: 'Useful fixes',
    useCases: [
      'Change clothing without changing the face.',
      'Remove an unwanted object in the background.',
      'Clean up a poster, thumbnail, ad, or social creative.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Keep the face exactly the same and change only the shirt to white linen.',
      'Remove the unreadable sign text while preserving the background style.',
      'Make the background cleaner for a paid social ad.',
    ],
    faq: [
      {
        q: 'Do I need the original Midjourney prompt?',
        a: 'No. The workflow starts from the exported image file.',
      },
      {
        q: 'Does it work for Flux or GPT Image too?',
        a: 'Yes. Any uploaded image can use the same layer-based revision workflow.',
      },
    ],
    cta: 'Edit a Midjourney image',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'edit-poster-without-photoshop',
    title: 'Edit Posters Without Photoshop | Image Layered',
    description:
      'Turn a flat poster image into editable layers for text, logo, subject, product, background, and effects. Remix ads without a PSD.',
    keyword: 'edit poster without Photoshop',
    eyebrow: 'Poster remix workflow',
    h1: 'Edit posters without Photoshop',
    intro:
      'When you only have a flattened poster, every change feels like a rebuild. Image Layered helps recover editable structure from a PNG or JPG so you can revise campaign assets faster.',
    pain:
      'Changing a headline, product, logo, character, or background usually requires the original design file. Many teams only have the exported image.',
    solution:
      'Separate poster elements into layers, edit the layer that needs work, and export a new creative for the campaign.',
    workflowTitle: 'Poster workflow',
    workflow: [
      'Upload the poster image.',
      'Generate layers for subject, headline, logo, product, background, and effects.',
      'Select the text, product, or background layer.',
      'Remix and export the updated poster.',
    ],
    useCasesTitle: 'Campaign use cases',
    useCases: [
      'Translate poster copy for a new market.',
      'Swap a product in an approved campaign layout.',
      'Create A/B test variations for ads and social posts.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Change the headline to New Arrival while keeping a similar typography style.',
      'Replace the center product with a premium perfume bottle.',
      'Turn the background into a neon night scene without changing the character.',
    ],
    faq: [
      {
        q: 'Can it work without a PSD file?',
        a: 'Yes. The page is designed around starting from a flattened PNG or JPG.',
      },
      {
        q: 'Can I download separate poster elements?',
        a: 'Yes. You can extract individual layers for use in other design tools.',
      },
    ],
    cta: 'Remix a poster',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'separate-text-from-image-ai',
    title: 'Separate Text From Image With AI | Image Layered',
    description:
      'Separate text from posters, ads, thumbnails, and product creatives so you can translate, remove, rewrite, or export it.',
    keyword: 'separate text from image AI',
    eyebrow: 'Editable image text',
    h1: 'Separate text from an image with AI',
    intro:
      'Text inside an image is often the reason a good creative cannot be reused. Layer separation helps treat text as a visual element that can be removed, replaced, translated, or exported.',
    pain:
      'OCR can read text, but it does not rebuild the background behind it or preserve the poster design.',
    solution:
      'Image Layered separates text, background, logo, subject, and effects so you can revise the visual asset instead of only extracting words.',
    workflowTitle: 'Text separation workflow',
    workflow: [
      'Upload an ad, poster, thumbnail, or product image.',
      'Choose more layers if the image has multiple labels or slogans.',
      'Select the text layer.',
      'Remove, rewrite, translate, or export the text element.',
    ],
    useCasesTitle: 'When to use it',
    useCases: [
      'Translate ad creatives for another market.',
      'Remove outdated campaign copy.',
      'Extract logos, labels, and headlines for new layouts.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Remove the promotional text and reconstruct the background naturally.',
      'Change SALE to 50% OFF with a similar visual style.',
      'Separate the logo as a transparent layer.',
    ],
    faq: [
      {
        q: 'Is this the same as OCR?',
        a: 'No. OCR reads text. Image Layered helps edit text as part of the visual image.',
      },
      {
        q: 'Can it help localize ads?',
        a: 'Yes. Once text is isolated, replacing it with another language becomes much easier.',
      },
    ],
    cta: 'Separate image text',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'change-character-clothes-ai',
    title: 'Change Character Clothes With AI While Keeping the Face | Image Layered',
    description:
      'Change only the outfit of an AI character while preserving face, pose, body shape, background, and style.',
    keyword: 'change character clothes AI',
    eyebrow: 'Character outfit editing',
    h1: 'Change character clothes without changing the character',
    intro:
      'Character creators often need outfit variations, but full regeneration can make the person look different. Image Layered separates face, hair, clothing, body, and background so clothing edits stay targeted.',
    pain:
      'A new generation can change the eyes, jawline, proportions, pose, or art style. For recurring content, that breaks character identity.',
    solution:
      'Keep the face and body layers stable, select the clothing layer, and describe the outfit change.',
    workflowTitle: 'Character outfit workflow',
    workflow: [
      'Upload the character image.',
      'Separate face, hair, clothing, body, background, and lighting.',
      'Select the clothing layer.',
      'Generate the new outfit and recombine the image.',
    ],
    useCasesTitle: 'Creator use cases',
    useCases: [
      'Create outfit variations for a consistent AI character.',
      'Adapt one character for different seasons or campaigns.',
      'Make thumbnails, avatars, and posters with the same identity.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Keep the face and pose identical. Change only the outfit to a red leather jacket.',
      'Replace the dress with a clean white business suit.',
      'Make the clothing winter style while preserving the original character.',
    ],
    faq: [
      {
        q: 'Can this guarantee the exact same face?',
        a: 'No AI edit can guarantee perfection, but isolating clothing from the face reduces unwanted identity changes.',
      },
      {
        q: 'Does it work for anime characters?',
        a: 'Yes. Anime, avatar, influencer, and campaign characters are strong use cases.',
      },
    ],
    cta: 'Change character clothes',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'keep-same-composition-ai',
    title: 'Keep the Same Composition While Editing AI Images | Image Layered',
    description:
      'Make local AI image edits while preserving the approved composition, camera angle, layout, subject position, and background structure.',
    keyword: 'keep same composition AI',
    eyebrow: 'Composition-safe editing',
    h1: 'Keep the same composition while editing an AI image',
    intro:
      'Many AI images are approved because of their exact framing. When a client asks for a small change, you need to preserve the composition rather than generate a new direction.',
    pain:
      'Variation tools can shift the subject, crop, perspective, lighting, or visual hierarchy. That creates another review cycle instead of solving the note.',
    solution:
      'Layer-based editing lets you isolate the requested change and keep the rest of the image as the anchor for the final composition.',
    workflowTitle: 'Composition-safe workflow',
    workflow: [
      'Upload the approved image.',
      'Create layers for subject, background, text, and effects.',
      'Select only the part mentioned in the revision note.',
      'Apply the edit and compare the result with the original.',
    ],
    useCasesTitle: 'High-value moments',
    useCases: [
      'Client-approved ad layout needs a small product change.',
      'A thumbnail works, but one object or text block is wrong.',
      'A character image needs new clothing without moving the pose.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Keep composition, camera angle, and subject position exactly the same.',
      'Change only the background color while preserving all object placement.',
      'Replace the small object on the table without moving anything else.',
    ],
    faq: [
      {
        q: 'Why not just regenerate?',
        a: 'Because regeneration is useful for exploration, while layer editing is better for controlled revision after approval.',
      },
      {
        q: 'Can I compare before and after?',
        a: 'The product workflow is built around preserving a base image, editing selected layers, and exporting the recomposed result.',
      },
    ],
    cta: 'Edit with same composition',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'ai-image-revision-tool',
    title: 'AI Image Revision Tool for Ads, Products, and Characters | Image Layered',
    description:
      'A practical AI image revision tool for changing specific parts of finished images: products, backgrounds, text, clothing, lighting, and objects.',
    keyword: 'AI image revision tool',
    eyebrow: 'Revision instead of regeneration',
    h1: 'An AI image revision tool for finished creatives',
    intro:
      'Image teams do not only need generation. They need a reliable revision step. Image Layered is built for the moment when the image is close, but one detail blocks publishing.',
    pain:
      'Most AI tools are optimized for creating new images. Production work needs edits, approvals, variants, exports, and predictable changes.',
    solution:
      'Use layer separation as the operating layer between AI generation and final design. Select the element, edit it, export layers, and recombine the image.',
    workflowTitle: 'Revision workflow',
    workflow: [
      'Upload the image that is almost ready.',
      'Separate it into editable layers.',
      'Choose product, background, clothing, text, lighting, or object.',
      'Generate a controlled revision and export the final creative.',
    ],
    useCasesTitle: 'Teams use it for',
    useCases: [
      'Ad creative revisions.',
      'Ecommerce image cleanup.',
      'Social thumbnails and poster remixes.',
      'Character consistency fixes.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Remove the visual artifact near the hand and keep everything else unchanged.',
      'Change the lighting to softer studio light without changing the product.',
      'Rewrite the ad headline and preserve the layout.',
    ],
    faq: [
      {
        q: 'Who is this for?',
        a: 'Marketers, ecommerce sellers, designers, AI creators, and anyone who needs controlled edits on finished images.',
      },
      {
        q: 'What makes it different?',
        a: 'The product starts from layer separation, so users can operate on parts of the image instead of treating the whole picture as one prompt.',
      },
    ],
    cta: 'Revise an image',
  },
  {
    market: 'en',
    lang: 'en',
    slug: 'modify-ai-character-without-changing-face',
    title: 'Modify AI Character Without Changing Face | Image Layered',
    description:
      'Modify an AI character scene, outfit, background, or lighting while keeping the same face and identity as much as possible.',
    keyword: 'modify AI character without changing face',
    eyebrow: 'Consistent character editing',
    h1: 'Modify an AI character without changing the face',
    intro:
      'A consistent character is valuable only if it keeps looking like the same person. Image Layered helps separate protected identity elements from editable scene elements.',
    pain:
      'Full regeneration can subtly change the face, eyes, hairstyle, body, and art direction. Those small differences add up across a series.',
    solution:
      'Separate face, hair, clothing, body, background, props, and lighting. Then edit the allowed layer while using the original face as a reference anchor.',
    workflowTitle: 'Identity-aware workflow',
    workflow: [
      'Upload the base character image.',
      'Generate layers for face, hair, clothing, body, background, props, and lighting.',
      'Keep identity layers visible and edit only the target layer.',
      'Export a new version that still reads as the same character.',
    ],
    useCasesTitle: 'Useful for',
    useCases: [
      'Anime and avatar creators.',
      'Recurring social characters.',
      'Brand mascots and campaign characters.',
      'Storyboards and thumbnail series.',
    ],
    promptsTitle: 'Prompt examples',
    prompts: [
      'Keep the face identical and change only the background to rainy Tokyo at night.',
      'Preserve the same character and replace the outfit with a black hoodie.',
      'Add cinematic rim lighting without changing the face or pose.',
    ],
    faq: [
      {
        q: 'Is this better than prompting the same character again?',
        a: 'For small revisions, starting from the existing image and editing layers is usually more controlled than generating a new image.',
      },
      {
        q: 'Can I protect the face layer?',
        a: 'Yes. The intended workflow is to keep identity layers separate and avoid editing them unless necessary.',
      },
    ],
    cta: 'Edit a character',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'editar-imagem-ia-sem-regenerar',
    title: 'Editar imagem de IA sem regenerar tudo | Image Layered',
    description:
      'Edite uma parte da imagem de IA sem perder composicao, rosto, produto ou layout. Separe em camadas, ajuste localmente e exporte o resultado.',
    keyword: 'editar imagem de IA sem regenerar',
    eyebrow: 'Edicao local de imagem com IA',
    h1: 'Edite imagens de IA sem comecar do zero',
    intro:
      'Quando uma imagem gerada por IA esta quase perfeita, regenerar tudo costuma destruir o que ja estava bom. Image Layered transforma a imagem em camadas editaveis para voce alterar apenas o elemento certo.',
    pain:
      'O problema nao e gerar mais imagens. O problema e mudar uma roupa, um produto, uma palavra ou o fundo sem perder o rosto, a pose, a luz e a composicao original.',
    solution:
      'Envie a imagem, crie camadas automaticas, selecione o objeto e descreva a alteracao. O restante da composicao permanece como referencia visual.',
    workflowTitle: 'Fluxo recomendado',
    workflow: [
      'Carregue JPG, PNG ou WEBP.',
      'Use Qwen Image Layered para separar personagem, texto, produto, fundo e sombra.',
      'Selecione a camada que precisa de revisao.',
      'Digite uma instrucao curta e exporte a composicao final.',
    ],
    useCasesTitle: 'Ideal para',
    useCases: [
      'Criadores que usam Midjourney, Flux ou GPT Image.',
      'Equipes de marketing que precisam testar variacoes de anuncio.',
      'Designers que querem preservar layout aprovado pelo cliente.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Troque apenas a jaqueta para preto acetinado, mantendo rosto e pose.',
      'Remova o objeto da direita e preserve o fundo original.',
      'Mude o texto principal para Summer Drop sem alterar a arte.',
    ],
    faq: [
      {
        q: 'Isso substitui um gerador de imagem?',
        a: 'Nao. Ele complementa geradores de imagem, porque resolve a etapa de revisao controlada depois que a imagem base ja existe.',
      },
      {
        q: 'Consigo preservar o rosto?',
        a: 'Sim, o objetivo e editar uma camada ou regiao especifica enquanto o resto da composicao continua como referencia.',
      },
    ],
    cta: 'Comecar com uma imagem',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'mudar-fundo-foto-produto-ia',
    title: 'Mudar fundo de foto de produto com IA | Image Layered',
    description:
      'Separe produto, fundo e sombra em camadas para trocar o cenario sem deformar o item. Ideal para catalogos, anuncios e Shopify.',
    keyword: 'mudar fundo de foto de produto com IA',
    eyebrow: 'Produto intacto, fundo novo',
    h1: 'Mude o fundo da foto de produto sem deformar o produto',
    intro:
      'Fotos de produto precisam ser consistentes. Com camadas editaveis, voce pode trocar o fundo, manter contornos e preservar sombras que fazem a imagem parecer real.',
    pain:
      'Ferramentas simples de remover fundo deixam o produto flutuando. Geradores de imagem podem mudar embalagem, proporcao ou detalhes de marca.',
    solution:
      'Image Layered separa produto, sombra, texto e fundo. Assim voce altera o cenario enquanto protege o item que precisa vender.',
    workflowTitle: 'Como usar',
    workflow: [
      'Envie a foto do produto.',
      'Gere de 3 a 6 camadas para produto, sombra e fundo.',
      'Selecione o fundo e descreva o novo ambiente.',
      'Exporte a imagem final para loja, marketplace ou anuncio.',
    ],
    useCasesTitle: 'Cenarios comerciais',
    useCases: [
      'Fundo branco para Amazon ou marketplace.',
      'Cenario premium para perfumes, cosmeticos e acessorios.',
      'Variacoes sazonais para campanhas de Black Friday e Natal.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Substitua o fundo por estudio branco minimalista com sombra suave.',
      'Crie um fundo premium de marmore claro, mantendo o produto identico.',
      'Transforme o cenario em uma bancada de cozinha limpa e moderna.',
    ],
    faq: [
      {
        q: 'O produto pode mudar?',
        a: 'A recomendacao e manter o produto em uma camada separada e editar apenas o fundo, reduzindo o risco de deformacao.',
      },
      {
        q: 'Serve para lote de produtos?',
        a: 'A pagina atual foca o fluxo individual; o mesmo posicionamento prepara uma oferta futura de workflow e lote.',
      },
    ],
    cta: 'Editar foto de produto',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'editar-imagem-midjourney',
    title: 'Editar imagem do Midjourney sem perder composicao | Image Layered',
    description:
      'Corrija detalhes em imagens do Midjourney: roupa, texto, objeto, fundo e cores sem regenerar a cena inteira.',
    keyword: 'editar imagem Midjourney',
    eyebrow: 'Revisao para Midjourney',
    h1: 'Edite uma imagem do Midjourney sem destruir a composicao',
    intro:
      'Midjourney cria imagens fortes, mas pequenos erros podem travar o uso comercial. A solucao e separar a imagem em camadas e revisar apenas o que esta errado.',
    pain:
      'Ao pedir uma nova variacao, voce pode perder expressao, enquadramento, cor e estilo. Isso custa tempo e reduz consistencia.',
    solution:
      'Com Image Layered, a imagem vira um arquivo editavel por partes. Voce seleciona a camada e pede uma correcao localizada.',
    workflowTitle: 'Fluxo de revisao',
    workflow: [
      'Exporte sua imagem do Midjourney.',
      'Carregue no Image Layered.',
      'Separe sujeito, fundo, texto e objetos.',
      'Corrija apenas a camada com erro.',
    ],
    useCasesTitle: 'Correcoes comuns',
    useCases: [
      'Trocar roupa sem alterar o rosto.',
      'Remover um objeto estranho no fundo.',
      'Adaptar a imagem para anuncio, thumbnail ou capa.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Mantenha o rosto igual e troque apenas a camiseta por camisa branca.',
      'Remova o texto incorreto do cartaz e preserve o estilo visual.',
      'Deixe o fundo mais limpo para uso em anuncio.',
    ],
    faq: [
      {
        q: 'Preciso do prompt original do Midjourney?',
        a: 'Nao. A edicao parte da imagem final carregada, nao do prompt original.',
      },
      {
        q: 'Funciona com imagens de outros modelos?',
        a: 'Sim. O fluxo tambem se aplica a Flux, GPT Image e outros geradores.',
      },
    ],
    cta: 'Editar imagem do Midjourney',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'editar-poster-sem-photoshop',
    title: 'Editar poster sem Photoshop usando IA | Image Layered',
    description:
      'Separe texto, pessoa, logo, produto e fundo de um poster para remixar campanhas sem abrir Photoshop.',
    keyword: 'editar poster sem Photoshop',
    eyebrow: 'Poster editavel em camadas',
    h1: 'Edite posters sem Photoshop',
    intro:
      'Para campanhas rapidas, abrir um arquivo complexo ou recriar a arte do zero e lento. Image Layered converte o poster plano em camadas para edicoes objetivas.',
    pain:
      'Designers e criadores precisam trocar texto, imagem, produto ou atmosfera sem perder a estrutura aprovada.',
    solution:
      'A separacao por camadas permite isolar texto, logo, personagem, efeitos e fundo. Depois voce edita com prompt ou exporta assets.',
    workflowTitle: 'Fluxo de poster',
    workflow: [
      'Envie o poster final em PNG ou JPG.',
      'Separe entre 5 e 10 camadas.',
      'Selecione texto, produto, pessoa ou fundo.',
      'Remixe e exporte para a campanha.',
    ],
    useCasesTitle: 'Usos práticos',
    useCases: [
      'Adaptar uma arte para outro idioma.',
      'Trocar produto em uma campanha sazonal.',
      'Criar variacoes para A/B testing.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Troque o titulo para New Arrival, mantendo tipografia parecida.',
      'Substitua o produto central por uma garrafa de perfume premium.',
      'Transforme o fundo em noite neon sem alterar o personagem.',
    ],
    faq: [
      {
        q: 'Funciona sem PSD?',
        a: 'Sim. A proposta e comecar de um JPG ou PNG achatado e recuperar camadas editaveis.',
      },
      {
        q: 'Posso exportar camadas separadas?',
        a: 'Sim, o fluxo do produto foi pensado para editar, extrair e recompor camadas.',
      },
    ],
    cta: 'Remixar um poster',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'separar-texto-de-imagem-ia',
    title: 'Separar texto de imagem com IA | Image Layered',
    description:
      'Extraia ou edite texto em posters e criativos mantendo fundo, personagem e composicao visual.',
    keyword: 'separar texto de imagem com IA',
    eyebrow: 'Texto editavel',
    h1: 'Separe texto de uma imagem com IA',
    intro:
      'Textos dentro de imagens costumam impedir reutilizacao. Ao transformar a arte em camadas, voce pode isolar chamadas, selos, labels e slogans.',
    pain:
      'OCR extrai palavras, mas nao resolve design. O desafio e remover ou trocar texto preservando o visual atras dele.',
    solution:
      'Image Layered identifica elementos visuais e cria camadas editaveis para texto e fundo, facilitando traducao e remix.',
    workflowTitle: 'Como separar texto',
    workflow: [
      'Carregue o criativo com texto.',
      'Peça mais camadas se houver muitos labels.',
      'Selecione a camada de texto.',
      'Reescreva, remova ou exporte o elemento.',
    ],
    useCasesTitle: 'Quando usar',
    useCases: [
      'Traduzir anuncios para outros mercados.',
      'Remover texto antigo de criativos reaproveitados.',
      'Extrair chamadas para montar novas variacoes.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Remova o texto promocional e reconstrua o fundo atras dele.',
      'Troque SALE por 50% OFF com estilo semelhante.',
      'Separe o logotipo e mantenha o fundo transparente.',
    ],
    faq: [
      {
        q: 'E igual a OCR?',
        a: 'Nao. OCR le texto; Image Layered ajuda a tratar o texto como elemento visual editavel.',
      },
      {
        q: 'Da para traduzir criativos?',
        a: 'Sim, especialmente quando o texto vira uma camada separada e pode ser reescrito.',
      },
    ],
    cta: 'Separar texto agora',
  },
  {
    market: 'pt',
    lang: 'pt-BR',
    slug: 'editar-personagem-consistente-ia',
    title: 'Editar personagem de IA mantendo consistencia | Image Layered',
    description:
      'Altere roupa, fundo ou objetos de um personagem de IA sem perder rosto, pose e identidade visual.',
    keyword: 'editar personagem consistente com IA',
    eyebrow: 'Personagem consistente',
    h1: 'Edite personagens de IA mantendo consistencia',
    intro:
      'Criadores de personagens precisam variar cenas sem perder identidade. A edicao por camadas ajuda a proteger rosto e silhueta enquanto voce modifica outros elementos.',
    pain:
      'Regenerar a imagem pode mudar olhos, rosto, proporcoes e estilo. Para series e conteudo recorrente, isso quebra consistencia.',
    solution:
      'Separe personagem, roupa, cabelo, fundo e luz. Depois edite apenas a camada necessaria para criar variacoes controladas.',
    workflowTitle: 'Fluxo para personagens',
    workflow: [
      'Envie a imagem base do personagem.',
      'Separe personagem, roupa e fundo.',
      'Escolha a camada que pode mudar.',
      'Exporte uma nova versao mantendo a identidade.',
    ],
    useCasesTitle: 'Criadores usam para',
    useCases: [
      'Trocar roupa entre cenas.',
      'Adaptar o fundo para outro clima.',
      'Criar thumbnails e posters com o mesmo personagem.',
    ],
    promptsTitle: 'Prompts prontos',
    prompts: [
      'Mantenha o rosto igual e troque apenas a roupa por jaqueta vermelha.',
      'Mude o fundo para noite chuvosa em Toquio.',
      'Adicione iluminacao cinematografica sem alterar a pose.',
    ],
    faq: [
      {
        q: 'Garante 100% de consistencia?',
        a: 'Nenhuma IA garante 100%, mas editar por camadas reduz mudancas indesejadas em partes que devem permanecer iguais.',
      },
      {
        q: 'Serve para anime?',
        a: 'Sim. O fluxo e especialmente util para anime, avatares e personagens de campanha.',
      },
    ],
    cta: 'Editar personagem',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'ai-gazo-saiseisei-nashi-henshu',
    title: 'AI画像を再生成せずに編集 | Image Layered',
    description:
      'AI画像の一部だけを編集。構図、顔、商品、背景を保ちながら、レイヤー分解で必要な要素だけを変更できます。',
    keyword: 'AI画像 再生成せずに編集',
    eyebrow: 'AI画像の部分編集',
    h1: 'AI画像を最初から作り直さずに編集',
    intro:
      'AI画像がほぼ完成しているのに、細部だけ直したいことがあります。Image Layered は画像を編集可能なレイヤーに分け、必要な部分だけを変更しやすくします。',
    pain:
      '再生成すると、顔、構図、光、雰囲気まで変わってしまいます。欲しいのは新しい画像ではなく、正確な修正です。',
    solution:
      '画像をアップロードし、自動レイヤー化して、変更したい要素を選びます。残したい部分はそのまま参照として使えます。',
    workflowTitle: 'おすすめの流れ',
    workflow: [
      'JPG、PNG、WEBPをアップロード。',
      '人物、商品、文字、背景、影をレイヤーに分解。',
      '修正したいレイヤーを選択。',
      '短い指示文で編集し、合成画像を書き出し。',
    ],
    useCasesTitle: '向いている用途',
    useCases: [
      'Midjourney、Flux、GPT Image の後編集。',
      '広告クリエイティブの細部修正。',
      '承認済み構図を崩さないデザイン修正。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      '顔とポーズを保ったまま、上着だけを黒いサテンに変更。',
      '右側の不要な物体だけを削除し、背景を自然に補完。',
      '見出しを Summer Drop に変更し、全体のデザインは維持。',
    ],
    faq: [
      {
        q: '画像生成ツールの代わりですか？',
        a: '代わりではなく、生成後の修正工程を補完するツールです。',
      },
      {
        q: '顔を保ったまま編集できますか？',
        a: '顔を編集対象から外し、別のレイヤーだけを変更することで、意図しない変化を減らせます。',
      },
    ],
    cta: '画像をアップロード',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'ai-shohin-shashin-haikei-henko',
    title: 'AIで商品写真の背景を変更 | Image Layered',
    description:
      '商品、背景、影を分けて、商品を崩さずに背景だけ変更。EC、広告、商品カタログ向けのAI編集。',
    keyword: '商品写真 背景変更 AI',
    eyebrow: '商品はそのまま、背景だけ変更',
    h1: '商品写真の背景をAIで自然に変更',
    intro:
      'ECの商品画像では、商品そのものを変えずに背景だけ整えることが重要です。レイヤー編集なら、商品と影を守りながら背景を差し替えられます。',
    pain:
      '単純な背景削除では商品が浮いて見えます。画像生成では商品の形やラベルが変わることがあります。',
    solution:
      'Image Layered は商品、影、背景、文字を別レイヤーに分け、背景だけを編集するワークフローを作ります。',
    workflowTitle: '使い方',
    workflow: [
      '商品写真をアップロード。',
      '商品、影、背景の3〜6レイヤーを生成。',
      '背景レイヤーを選択。',
      '白背景、スタジオ、ライフスタイル背景として書き出し。',
    ],
    useCasesTitle: 'ECでの活用',
    useCases: [
      'AmazonやShopify向けの白背景。',
      '化粧品や香水の高級感ある背景。',
      '季節キャンペーン用の背景バリエーション。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      '商品を完全に維持し、背景を白いスタジオに変更。',
      '明るい大理石の高級感ある背景に変更。',
      '自然な柔らかい影を残して、背景をミニマルに。',
    ],
    faq: [
      {
        q: '商品が変形しませんか？',
        a: '商品レイヤーを保護し、背景だけを編集する使い方が推奨です。',
      },
      {
        q: '広告画像にも使えますか？',
        a: 'はい。商品画像、バナー、SNS広告の背景差し替えに向いています。',
      },
    ],
    cta: '商品写真を編集',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'midjourney-gazo-henshu',
    title: 'Midjourney画像を構図そのまま編集 | Image Layered',
    description:
      'Midjourney画像の服、文字、背景、不要物を部分修正。再生成せずに構図と雰囲気を保ちます。',
    keyword: 'Midjourney 画像 編集',
    eyebrow: 'Midjourneyの後編集',
    h1: 'Midjourney画像を構図そのまま修正',
    intro:
      'Midjourney の画像は完成度が高い一方、商用利用前に細かい修正が必要になることがあります。レイヤー化すれば、問題のある部分だけを直せます。',
    pain:
      '再ロールやバリエーションでは、気に入っていた表情や構図まで変わってしまいます。',
    solution:
      'Image Layered で人物、背景、文字、装飾を分け、対象レイヤーだけをAI編集します。',
    workflowTitle: '修正フロー',
    workflow: [
      'Midjourney画像を書き出す。',
      'Image Layered にアップロード。',
      '人物、背景、文字、物体に分解。',
      '問題のあるレイヤーだけを修正。',
    ],
    useCasesTitle: 'よくある修正',
    useCases: [
      '顔を変えずに服だけ変更。',
      '背景の不要物を削除。',
      '広告やサムネイル向けに整える。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      '顔は同じまま、Tシャツだけを白いシャツに変更。',
      'ポスターの読めない文字を削除し、背景を自然に復元。',
      '広告用に背景をよりクリーンに。',
    ],
    faq: [
      {
        q: '元のMidjourneyプロンプトは必要ですか？',
        a: '必要ありません。完成した画像から編集できます。',
      },
      {
        q: 'FluxやGPT画像にも使えますか？',
        a: 'はい。画像ファイルとしてアップロードできれば同じ流れで使えます。',
      },
    ],
    cta: 'Midjourney画像を編集',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'photoshop-nashi-poster-henshu',
    title: 'Photoshopなしでポスター編集 | Image Layered',
    description:
      '1枚のポスター画像から人物、商品、文字、ロゴ、背景を分離。Photoshopなしで広告をリミックス。',
    keyword: 'Photoshopなし ポスター編集',
    eyebrow: 'ポスターをレイヤー化',
    h1: 'Photoshopなしでポスターを編集',
    intro:
      'PSDがないポスターでも、画像をレイヤーに分ければ再利用できます。キャンペーン変更や多言語展開に便利です。',
    pain:
      '完成画像しかない場合、文字や商品を変えるには作り直しが必要になりがちです。',
    solution:
      'Image Layered はポスター内の人物、文字、ロゴ、背景、装飾を分け、編集しやすい構造にします。',
    workflowTitle: 'ポスター編集の流れ',
    workflow: [
      'PNGまたはJPGのポスターをアップロード。',
      '5〜10レイヤーに分解。',
      '文字、商品、人物、背景を選ぶ。',
      '新しいキャンペーン用に編集して書き出し。',
    ],
    useCasesTitle: '活用例',
    useCases: [
      'キャンペーン名の変更。',
      '商品差し替え。',
      'SNS広告向けのバリエーション作成。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      'タイトルを New Arrival に変更し、近い書体を維持。',
      '中央の商品を高級な香水ボトルに差し替え。',
      '人物を変えずに背景をネオンの夜景に変更。',
    ],
    faq: [
      {
        q: 'PSDがなくても使えますか？',
        a: 'はい。JPGやPNGから編集可能なレイヤー構造を作ることが目的です。',
      },
      {
        q: 'レイヤーごとに書き出せますか？',
        a: '個別レイヤーの抽出や再合成を前提にした編集体験です。',
      },
    ],
    cta: 'ポスターを編集',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'gazo-moji-bunri-ai',
    title: '画像から文字をAIで分離 | Image Layered',
    description:
      'ポスターや広告画像の文字をレイヤーとして分離。翻訳、削除、書き換えをしやすくします。',
    keyword: '画像 文字 分離 AI',
    eyebrow: '文字を編集可能に',
    h1: '画像の文字をAIで分離して編集',
    intro:
      '画像内の文字は、翻訳や再利用の大きな障害になります。レイヤー化すれば、文字をデザイン要素として扱えます。',
    pain:
      'OCRは文字を読むだけです。実際に必要なのは、文字を消したり、書き換えたり、背景を自然に戻すことです。',
    solution:
      'Image Layered は文字、背景、ロゴ、装飾を分け、広告やポスターを再編集しやすくします。',
    workflowTitle: '文字分離の流れ',
    workflow: [
      '文字入り画像をアップロード。',
      '文字が多い場合はレイヤー数を増やす。',
      '文字レイヤーを選択。',
      '削除、書き換え、翻訳、抽出を行う。',
    ],
    useCasesTitle: '使いどころ',
    useCases: [
      '海外向け広告への翻訳。',
      '古いキャンペーン文言の削除。',
      'ロゴや見出し素材の抽出。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      'プロモーション文字を削除し、背景を自然に補完。',
      'SALE を 50% OFF に変更し、似たスタイルを維持。',
      'ロゴだけを透明背景で分離。',
    ],
    faq: [
      {
        q: 'OCRとの違いは？',
        a: 'OCRは文字認識です。Image Layered は文字を視覚レイヤーとして編集するためのものです。',
      },
      {
        q: '翻訳した文字に差し替えられますか？',
        a: '文字が分離できれば、別言語への差し替えに使いやすくなります。',
      },
    ],
    cta: '文字を分離',
  },
  {
    market: 'ja',
    lang: 'ja',
    slug: 'consistent-character-ai-henshu',
    title: 'AIキャラクターを一貫性を保って編集 | Image Layered',
    description:
      'AIキャラクターの顔、ポーズ、雰囲気を保ちながら、服、背景、小物だけを変更します。',
    keyword: 'AIキャラクター 一貫性 編集',
    eyebrow: 'キャラクター一貫性',
    h1: 'AIキャラクターを一貫性を保って編集',
    intro:
      '連載コンテンツや広告キャラクターでは、同じ人物に見えることが重要です。レイヤー編集は、変えたい部分と守りたい部分を分けます。',
    pain:
      '再生成すると目、顔、髪型、体型、画風が微妙に変わり、同じキャラクターに見えなくなることがあります。',
    solution:
      '人物、服、髪、背景、光を分け、必要なレイヤーだけを編集して、キャラクター性を保ちます。',
    workflowTitle: 'キャラクター編集の流れ',
    workflow: [
      'ベース画像をアップロード。',
      '人物、服、背景を分解。',
      '変更してよいレイヤーを選択。',
      '同じキャラクターとして新しいバリエーションを作成。',
    ],
    useCasesTitle: 'クリエイター向け',
    useCases: [
      '服装の変更。',
      '背景や季節感の変更。',
      '同じキャラクターでサムネイルやポスターを作成。',
    ],
    promptsTitle: 'プロンプト例',
    prompts: [
      '顔を保ったまま、服だけを赤いジャケットに変更。',
      '背景を雨の東京の夜に変更。',
      'ポーズを変えずに映画的なライティングを追加。',
    ],
    faq: [
      {
        q: '完全に同じ顔を保証できますか？',
        a: 'AI編集に完全保証はありませんが、レイヤー単位で編集すると不要な変化を減らせます。',
      },
      {
        q: 'アニメキャラクターにも使えますか？',
        a: 'はい。アニメ、アバター、広告キャラクターの編集に向いています。',
      },
    ],
    cta: 'キャラクターを編集',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'redaktirovat-ai-izobrazhenie-bez-regeneracii',
    title: 'Редактировать AI-изображение без регенерации | Image Layered',
    description:
      'Изменяйте отдельные объекты, фон, текст или одежду в AI-изображении, сохраняя композицию, лицо и стиль.',
    keyword: 'редактировать AI изображение без регенерации',
    eyebrow: 'Локальное редактирование AI-изображений',
    h1: 'Редактируйте AI-изображения без создания заново',
    intro:
      'Когда изображение почти идеально, полная регенерация часто ломает то, что уже работает. Image Layered превращает плоскую картинку в редактируемые слои.',
    pain:
      'Нужно заменить деталь, убрать объект или исправить текст, но сохранить лицо, свет, позу и композицию.',
    solution:
      'Загрузите изображение, разделите его на слои, выберите нужный элемент и опишите правку. Остальная сцена остается визуальной опорой.',
    workflowTitle: 'Рекомендуемый процесс',
    workflow: [
      'Загрузите JPG, PNG или WEBP.',
      'Разделите персонажа, продукт, текст, фон и тени на слои.',
      'Выберите слой, который требует правки.',
      'Введите короткую инструкцию и экспортируйте результат.',
    ],
    useCasesTitle: 'Для кого',
    useCases: [
      'Авторы, работающие с Midjourney, Flux или GPT Image.',
      'Маркетологи, тестирующие рекламные креативы.',
      'Дизайнеры, которым важно сохранить утвержденный макет.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Измени только куртку на черную атласную, лицо и позу не менять.',
      'Удали объект справа и естественно восстанови фон.',
      'Замени заголовок на Summer Drop, сохрани общий дизайн.',
    ],
    faq: [
      {
        q: 'Это генератор изображений?',
        a: 'Нет. Это инструмент для контролируемой пост-обработки уже существующих изображений.',
      },
      {
        q: 'Можно сохранить лицо?',
        a: 'Да, если редактировать отдельный слой и не трогать слой с лицом или персонажем.',
      },
    ],
    cta: 'Загрузить изображение',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'izmenit-fon-foto-tovara-ai',
    title: 'Изменить фон фото товара с AI | Image Layered',
    description:
      'Разделите товар, фон и тень на слои, чтобы менять сцену без искажения продукта. Для e-commerce, рекламы и каталогов.',
    keyword: 'изменить фон фото товара AI',
    eyebrow: 'Товар остается, фон меняется',
    h1: 'Меняйте фон товарного фото без искажения продукта',
    intro:
      'Для e-commerce важно сохранить форму, упаковку и детали товара. Слои позволяют менять окружение, не перерисовывая сам продукт.',
    pain:
      'Удаление фона часто выглядит плоско, а генерация заново может изменить этикетку, форму или пропорции.',
    solution:
      'Image Layered отделяет товар, тень, текст и фон, чтобы редактировать только сцену вокруг продукта.',
    workflowTitle: 'Как это работает',
    workflow: [
      'Загрузите фото товара.',
      'Создайте 3-6 слоев для товара, тени и фона.',
      'Выберите фон.',
      'Опишите новую сцену и экспортируйте изображение.',
    ],
    useCasesTitle: 'Коммерческие сценарии',
    useCases: [
      'Белый фон для маркетплейсов.',
      'Премиальная сцена для косметики и аксессуаров.',
      'Сезонные варианты для рекламных кампаний.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Замени фон на минималистичную белую студию с мягкой тенью.',
      'Сделай светлый мраморный фон, продукт оставить без изменений.',
      'Добавь чистую современную кухонную столешницу на фоне.',
    ],
    faq: [
      {
        q: 'Может ли товар измениться?',
        a: 'Лучший способ - держать товар отдельным слоем и редактировать только фон.',
      },
      {
        q: 'Подходит для Shopify?',
        a: 'Да, такие изображения подходят для карточек товаров, лендингов и рекламы.',
      },
    ],
    cta: 'Редактировать товарное фото',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'redaktirovat-midjourney-izobrazhenie',
    title: 'Редактировать изображение Midjourney без потери композиции',
    description:
      'Исправляйте одежду, фон, текст и объекты в Midjourney-изображениях без полной регенерации сцены.',
    keyword: 'редактировать изображение Midjourney',
    eyebrow: 'Пост-обработка Midjourney',
    h1: 'Редактируйте Midjourney-изображения, сохраняя композицию',
    intro:
      'Midjourney дает сильную основу, но для коммерческого результата часто нужны точечные правки. Слои помогают исправить только проблемный элемент.',
    pain:
      'Новая вариация может изменить настроение, ракурс, лицо и цвета. Это ломает уже выбранный вариант.',
    solution:
      'Image Layered разделяет сцену на элементы, чтобы вы могли редактировать нужный слой локально.',
    workflowTitle: 'Процесс правки',
    workflow: [
      'Экспортируйте изображение из Midjourney.',
      'Загрузите его в Image Layered.',
      'Разделите на персонажа, фон, текст и объекты.',
      'Исправьте только нужный слой.',
    ],
    useCasesTitle: 'Типичные правки',
    useCases: [
      'Сменить одежду без изменения лица.',
      'Удалить лишний объект на фоне.',
      'Подготовить изображение для рекламы или обложки.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Сохрани лицо, замени только футболку на белую рубашку.',
      'Удали неправильный текст на постере и восстанови фон.',
      'Сделай фон чище для рекламного баннера.',
    ],
    faq: [
      {
        q: 'Нужен исходный prompt?',
        a: 'Нет. Редактирование начинается с готового изображения.',
      },
      {
        q: 'Работает только с Midjourney?',
        a: 'Нет, подходит и для Flux, GPT Image и других генераторов.',
      },
    ],
    cta: 'Редактировать Midjourney',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'redaktirovat-poster-bez-photoshop',
    title: 'Редактировать постер без Photoshop | Image Layered',
    description:
      'Разделяйте текст, персонажа, логотип, продукт и фон в готовом постере, чтобы быстро делать новые версии.',
    keyword: 'редактировать постер без Photoshop',
    eyebrow: 'Постер как набор слоев',
    h1: 'Редактируйте постеры без Photoshop',
    intro:
      'Если у вас есть только готовый JPG или PNG, правки обычно требуют пересборки макета. Image Layered помогает вернуть структуру слоев.',
    pain:
      'Нужно заменить текст, продукт или фон, но PSD-файла нет, а дедлайн близко.',
    solution:
      'Инструмент выделяет текст, логотип, персонажа, фон и декоративные элементы, чтобы постер можно было быстро ремиксовать.',
    workflowTitle: 'Процесс для постера',
    workflow: [
      'Загрузите готовый постер.',
      'Создайте 5-10 слоев.',
      'Выберите текст, продукт, человека или фон.',
      'Отредактируйте и экспортируйте новый креатив.',
    ],
    useCasesTitle: 'Практические задачи',
    useCases: [
      'Адаптация постера под другой язык.',
      'Замена продукта в сезонной кампании.',
      'A/B варианты для рекламы.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Замени заголовок на New Arrival, сохрани похожий стиль шрифта.',
      'Поставь в центр премиальный флакон духов.',
      'Сделай фон киберпанк-ночью, персонажа не менять.',
    ],
    faq: [
      {
        q: 'Можно без PSD?',
        a: 'Да. Смысл как раз в том, чтобы начать с плоской картинки.',
      },
      {
        q: 'Можно скачать отдельные слои?',
        a: 'Рабочий процесс рассчитан на извлечение, редактирование и повторную сборку слоев.',
      },
    ],
    cta: 'Редактировать постер',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'otdelit-tekst-ot-izobrazheniya-ai',
    title: 'Отделить текст от изображения с AI | Image Layered',
    description:
      'Извлекайте и редактируйте текст в постерах и рекламных креативах, сохраняя фон и визуальный стиль.',
    keyword: 'отделить текст от изображения AI',
    eyebrow: 'Текст как редактируемый слой',
    h1: 'Отделите текст от изображения с помощью AI',
    intro:
      'Текст внутри изображения мешает локализации и повторному использованию креатива. Слои превращают его в управляемый визуальный элемент.',
    pain:
      'OCR распознает слова, но не помогает удалить текст, восстановить фон или заменить надпись в дизайне.',
    solution:
      'Image Layered разделяет текст, фон, логотипы и декоративные элементы, чтобы креатив можно было перевести или обновить.',
    workflowTitle: 'Как отделить текст',
    workflow: [
      'Загрузите изображение с текстом.',
      'Увеличьте число слоев для сложного макета.',
      'Выберите текстовый слой.',
      'Удалите, перепишите или экспортируйте текст.',
    ],
    useCasesTitle: 'Когда полезно',
    useCases: [
      'Локализация рекламы.',
      'Удаление старых акций.',
      'Извлечение логотипов и заголовков.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Удали промо-текст и восстанови фон за ним.',
      'Замени SALE на 50% OFF в похожем стиле.',
      'Отдели логотип на прозрачном фоне.',
    ],
    faq: [
      {
        q: 'Это OCR?',
        a: 'Нет. OCR читает текст, а Image Layered помогает редактировать текст как часть изображения.',
      },
      {
        q: 'Можно перевести баннер?',
        a: 'Да, если текст выделен в слой, его проще заменить на другой язык.',
      },
    ],
    cta: 'Отделить текст',
  },
  {
    market: 'ru',
    lang: 'ru',
    slug: 'consistent-character-ai-redaktirovanie',
    title: 'Редактировать AI-персонажа с сохранением консистентности',
    description:
      'Меняйте одежду, фон и объекты у AI-персонажа, сохраняя лицо, позу и визуальную идентичность.',
    keyword: 'консистентный персонаж AI редактирование',
    eyebrow: 'Консистентный персонаж',
    h1: 'Редактируйте AI-персонажа, сохраняя узнаваемость',
    intro:
      'Для серийного контента персонаж должен оставаться тем же. Слои помогают отделить лицо и силуэт от одежды, фона и реквизита.',
    pain:
      'Полная регенерация меняет глаза, форму лица, пропорции и стиль, из-за чего персонаж перестает быть узнаваемым.',
    solution:
      'Разделите персонажа, одежду, волосы, фон и свет. Затем меняйте только нужный слой.',
    workflowTitle: 'Процесс для персонажа',
    workflow: [
      'Загрузите базовое изображение.',
      'Разделите персонажа, одежду и фон.',
      'Выберите слой, который можно менять.',
      'Создайте новую версию с той же идентичностью.',
    ],
    useCasesTitle: 'Для авторов',
    useCases: [
      'Смена одежды между сценами.',
      'Новый фон или сезон.',
      'Обложки и постеры с тем же героем.',
    ],
    promptsTitle: 'Примеры запросов',
    prompts: [
      'Сохрани лицо, замени только одежду на красную куртку.',
      'Измени фон на дождливую ночь в Токио.',
      'Добавь кинематографичный свет, позу не менять.',
    ],
    faq: [
      {
        q: 'Гарантируется полная консистентность?',
        a: 'Полной гарантии у AI нет, но редактирование слоями снижает риск нежелательных изменений.',
      },
      {
        q: 'Подходит для anime?',
        a: 'Да, особенно для аватаров, anime-персонажей и рекламных героев.',
      },
    ],
    cta: 'Редактировать персонажа',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'editar-imagen-ia-sin-regenerar',
    title: 'Editar imagen de IA sin regenerar todo | Image Layered',
    description:
      'Cambia solo un objeto, texto, fondo o prenda en una imagen de IA manteniendo composicion, rostro y estilo.',
    keyword: 'editar imagen de IA sin regenerar',
    eyebrow: 'Edicion local de imagen con IA',
    h1: 'Edita imagenes de IA sin empezar de cero',
    intro:
      'Cuando una imagen de IA ya esta casi lista, regenerarla completa puede arruinar lo que funcionaba. Image Layered la convierte en capas editables para corregir solo lo necesario.',
    pain:
      'El reto no es generar mas imagenes, sino cambiar un detalle sin perder cara, pose, luz, encuadre o layout.',
    solution:
      'Sube la imagen, crea capas automaticamente, selecciona el elemento y describe el cambio. El resto de la composicion se mantiene como referencia.',
    workflowTitle: 'Flujo recomendado',
    workflow: [
      'Sube JPG, PNG o WEBP.',
      'Separa personaje, producto, texto, fondo y sombras.',
      'Selecciona la capa que quieres corregir.',
      'Escribe una instruccion corta y exporta el resultado.',
    ],
    useCasesTitle: 'Perfecto para',
    useCases: [
      'Creadores que usan Midjourney, Flux o GPT Image.',
      'Equipos de anuncios que necesitan variantes rapidas.',
      'Disenadores que quieren conservar una composicion aprobada.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Cambia solo la chaqueta a satin negro, manteniendo rostro y pose.',
      'Elimina el objeto de la derecha y reconstruye el fondo natural.',
      'Cambia el titular a Summer Drop sin alterar el arte.',
    ],
    faq: [
      {
        q: 'Es otro generador de imagenes?',
        a: 'No. Es una herramienta para la etapa de post-edicion, cuando ya tienes una imagen base.',
      },
      {
        q: 'Puedo mantener el rostro?',
        a: 'Si. Editar por capas reduce cambios no deseados en las zonas que deben permanecer iguales.',
      },
    ],
    cta: 'Subir imagen',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'cambiar-fondo-foto-producto-ia',
    title: 'Cambiar fondo de foto de producto con IA | Image Layered',
    description:
      'Separa producto, fondo y sombra en capas para cambiar la escena sin deformar el producto. Ideal para e-commerce y anuncios.',
    keyword: 'cambiar fondo foto producto IA',
    eyebrow: 'Producto intacto, fondo nuevo',
    h1: 'Cambia el fondo de una foto de producto sin deformar el producto',
    intro:
      'Las fotos de producto necesitan consistencia. Con capas editables puedes cambiar el fondo, conservar bordes y mantener sombras realistas.',
    pain:
      'Quitar fondo no siempre basta, y regenerar la imagen puede alterar etiqueta, forma o proporcion del producto.',
    solution:
      'Image Layered separa producto, sombra, texto y fondo para que edites la escena sin tocar el item principal.',
    workflowTitle: 'Como usarlo',
    workflow: [
      'Sube la foto de producto.',
      'Genera 3 a 6 capas.',
      'Selecciona el fondo.',
      'Describe el nuevo escenario y exporta.',
    ],
    useCasesTitle: 'Casos de e-commerce',
    useCases: [
      'Fondo blanco para marketplaces.',
      'Escenas premium para cosmetica y accesorios.',
      'Variaciones estacionales para campanas.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Sustituye el fondo por estudio blanco minimalista con sombra suave.',
      'Crea un fondo de marmol claro premium, manteniendo el producto identico.',
      'Convierte el fondo en una cocina moderna y limpia.',
    ],
    faq: [
      {
        q: 'Puede cambiar el producto?',
        a: 'La mejor practica es mantener el producto separado y editar solo el fondo.',
      },
      {
        q: 'Sirve para Shopify?',
        a: 'Si, es util para fichas de producto, landings y anuncios.',
      },
    ],
    cta: 'Editar foto de producto',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'editar-imagen-midjourney',
    title: 'Editar imagen de Midjourney sin perder composicion',
    description:
      'Corrige ropa, texto, fondo u objetos en imagenes de Midjourney sin regenerar toda la escena.',
    keyword: 'editar imagen Midjourney',
    eyebrow: 'Post-edicion para Midjourney',
    h1: 'Edita imagenes de Midjourney conservando la composicion',
    intro:
      'Midjourney genera imagenes potentes, pero un pequeno error puede impedir su uso comercial. Con capas puedes corregir solo el elemento problematico.',
    pain:
      'Una variacion nueva puede cambiar rostro, angulo, color y estilo. Eso rompe la version que ya habias elegido.',
    solution:
      'Image Layered divide la imagen en elementos para editar localmente la capa correcta.',
    workflowTitle: 'Flujo de revision',
    workflow: [
      'Exporta tu imagen de Midjourney.',
      'Subela a Image Layered.',
      'Separa sujeto, fondo, texto y objetos.',
      'Corrige solo la capa necesaria.',
    ],
    useCasesTitle: 'Correcciones comunes',
    useCases: [
      'Cambiar ropa sin alterar la cara.',
      'Eliminar objetos extranos del fondo.',
      'Preparar la imagen para anuncio o miniatura.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Mantener la cara igual y cambiar solo la camiseta por camisa blanca.',
      'Eliminar texto incorrecto del poster y reconstruir el fondo.',
      'Hacer el fondo mas limpio para un banner publicitario.',
    ],
    faq: [
      {
        q: 'Necesito el prompt original?',
        a: 'No. Puedes trabajar desde la imagen final exportada.',
      },
      {
        q: 'Funciona con Flux o GPT Image?',
        a: 'Si. El flujo se aplica a cualquier imagen que puedas subir.',
      },
    ],
    cta: 'Editar Midjourney',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'editar-poster-sin-photoshop',
    title: 'Editar poster sin Photoshop con IA | Image Layered',
    description:
      'Separa texto, persona, logo, producto y fondo de un poster para crear nuevas versiones sin PSD.',
    keyword: 'editar poster sin Photoshop',
    eyebrow: 'Poster editable por capas',
    h1: 'Edita posters sin Photoshop',
    intro:
      'Si solo tienes un JPG o PNG final, modificar una campana suele requerir recrear el diseno. Image Layered recupera una estructura de capas editable.',
    pain:
      'Necesitas cambiar texto, producto o fondo sin tener el archivo fuente y sin perder el layout aprobado.',
    solution:
      'La separacion por capas aisla texto, logo, personaje, efectos y fondo para remixar rapidamente.',
    workflowTitle: 'Flujo para posters',
    workflow: [
      'Sube el poster en PNG o JPG.',
      'Genera 5 a 10 capas.',
      'Selecciona texto, producto, persona o fondo.',
      'Edita y exporta el nuevo creativo.',
    ],
    useCasesTitle: 'Usos practicos',
    useCases: [
      'Adaptar una pieza a otro idioma.',
      'Cambiar producto en una campana.',
      'Crear variantes para A/B testing.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Cambia el titulo a New Arrival manteniendo un estilo tipografico similar.',
      'Sustituye el producto central por un perfume premium.',
      'Convierte el fondo en una noche cyberpunk sin cambiar el personaje.',
    ],
    faq: [
      {
        q: 'Puedo usarlo sin PSD?',
        a: 'Si. La idea es partir de una imagen plana y hacerla editable por partes.',
      },
      {
        q: 'Puedo extraer capas?',
        a: 'Si, el producto esta pensado para editar, extraer y recomponer capas.',
      },
    ],
    cta: 'Editar poster',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'separar-texto-de-imagen-ia',
    title: 'Separar texto de una imagen con IA | Image Layered',
    description:
      'Extrae o cambia texto en posters y anuncios manteniendo fondo, personaje y estilo visual.',
    keyword: 'separar texto de imagen IA',
    eyebrow: 'Texto editable',
    h1: 'Separa texto de una imagen con IA',
    intro:
      'El texto dentro de una imagen dificulta traducciones y reutilizacion. Con capas, puedes tratarlo como un elemento visual editable.',
    pain:
      'OCR lee palabras, pero no elimina texto, no reconstruye el fondo y no mantiene el diseno.',
    solution:
      'Image Layered separa texto, fondo, logo y elementos graficos para actualizar o localizar creativos.',
    workflowTitle: 'Como separar texto',
    workflow: [
      'Sube una imagen con texto.',
      'Aumenta capas si hay muchos labels.',
      'Selecciona la capa de texto.',
      'Elimina, reescribe, traduce o exporta.',
    ],
    useCasesTitle: 'Cuando usarlo',
    useCases: [
      'Traducir anuncios para otros mercados.',
      'Eliminar promociones antiguas.',
      'Extraer logos y titulares.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Elimina el texto promocional y reconstruye el fondo.',
      'Cambia SALE por 50% OFF con estilo similar.',
      'Separa el logo con fondo transparente.',
    ],
    faq: [
      {
        q: 'Es OCR?',
        a: 'No. OCR reconoce texto; Image Layered ayuda a editar el texto como parte visual de la imagen.',
      },
      {
        q: 'Sirve para traducir anuncios?',
        a: 'Si, cuando el texto queda aislado es mucho mas facil reemplazarlo.',
      },
    ],
    cta: 'Separar texto',
  },
  {
    market: 'es',
    lang: 'es',
    slug: 'editar-personaje-consistente-ia',
    title: 'Editar personaje de IA manteniendo consistencia | Image Layered',
    description:
      'Cambia ropa, fondo u objetos de un personaje de IA sin perder rostro, pose e identidad visual.',
    keyword: 'editar personaje consistente IA',
    eyebrow: 'Consistencia de personaje',
    h1: 'Edita personajes de IA manteniendo consistencia',
    intro:
      'Para contenido recurrente, un personaje debe seguir pareciendo el mismo. Editar por capas separa lo que quieres cambiar de lo que necesitas proteger.',
    pain:
      'Regenerar puede cambiar ojos, rostro, cuerpo y estilo. Eso rompe la continuidad del personaje.',
    solution:
      'Separa personaje, ropa, pelo, fondo y luz. Luego cambia solo la capa necesaria.',
    workflowTitle: 'Flujo para personajes',
    workflow: [
      'Sube la imagen base del personaje.',
      'Separa personaje, ropa y fondo.',
      'Elige la capa que puede cambiar.',
      'Exporta una nueva version manteniendo identidad.',
    ],
    useCasesTitle: 'Para creadores',
    useCases: [
      'Cambiar ropa entre escenas.',
      'Adaptar fondo o clima.',
      'Crear miniaturas y posters con el mismo personaje.',
    ],
    promptsTitle: 'Prompts listos',
    prompts: [
      'Mantener la cara igual y cambiar solo la ropa por una chaqueta roja.',
      'Cambiar el fondo a noche lluviosa en Tokio.',
      'Agregar iluminacion cinematografica sin alterar la pose.',
    ],
    faq: [
      {
        q: 'Garantiza consistencia perfecta?',
        a: 'Ninguna IA lo garantiza al 100%, pero editar por capas reduce cambios no deseados.',
      },
      {
        q: 'Funciona para anime?',
        a: 'Si. Es util para anime, avatares y personajes de campana.',
      },
    ],
    cta: 'Editar personaje',
  },
];

export function getSeoPage(market: string, slug: string) {
  return imageLayeredSeoPages.find(
    (page) => page.market === market && page.slug === slug
  );
}

export function getSeoPagesByMarket(market: SeoMarket) {
  return imageLayeredSeoPages.filter((page) => page.market === market);
}
