import Link from 'next/link';

type SeoGuideProps = {
  locale: string;
  surface: 'home' | 'tool';
};

const homeCopy = {
  en: {
    title: 'A practical image editing workflow for controlled revisions',
    intro: 'Image Layered is an image editing workspace for people who already have a strong visual and need to change one part without losing everything else. Instead of asking a generator to recreate the entire composition, the source is separated into objects that can be selected, protected, revised, and exported. This approach makes asset production more predictable for product photography, advertising, social campaigns, posters, and AI-generated artwork.',
    sections: [
      ['Start from the image that already works', 'A useful visual often contains details that should not change: a recognizable product shape, a person’s identity, a logo, typography, lighting, or a carefully balanced layout. Full regeneration treats every pixel as negotiable. Layer-based image editing begins with the opposite assumption. The original image is the master creative, and only the selected object becomes editable. That distinction helps teams approve image changes faster and keeps every revision connected to the source.'],
      ['Turn a flat visual into editable objects', 'Upload a JPG, PNG, or WEBP file and generate a structured layer stack. The layer decomposition step identifies major subjects, products, text, backgrounds, shadows, and visual effects. Each layer can be shown, hidden, moved, resized, rotated, duplicated, locked, or exported. The canvas stays within a stable workspace, so a portrait artwork, square image, and wide banner all use the same professional editing layout.'],
      ['Describe the change instead of rebuilding the design', 'Select an image object and write a direct instruction such as “make the bottle dark green,” “rewrite the headline,” or “turn the background into a winter studio.” Image Layered sends the instruction to the selected layer and preserves unselected image content. The result appears as a new variation, while the previous image layer remains recoverable. This makes experimentation safer than destructive image editing.'],
      ['Lock brand-critical image details', 'Product teams frequently need many campaign versions while keeping the same product, logo, label, or character. Layer locks make that requirement explicit. Lock the image elements that define the brand, mark shape, logo, label, and shadow as preserved, then revise the editable background or decoration. The image editor carries those constraints into the AI instruction instead of relying on the user to repeat them in every prompt.'],
      ['Create reusable commercial assets', 'A layered image is more valuable than a single final export. Individual image objects can be downloaded for another design tool, while the full image can be recomposed as a production-ready PNG. Saved projects and version history support repeated image revision instead of one-off generation. Future variants can extend one master image into social, marketplace, and campaign formats without rebuilding the creative from zero.'],
      ['Move from random generation to controlled revision', 'Creative teams rarely need unlimited novelty. They need a reliable way to keep approved work, isolate a problem, make a focused correction, and review the result. A layer-first workspace turns that requirement into a visible process. The left panel shows what exists, the center canvas shows how objects combine, and the right inspector shows what can change. This structure reduces prompt guessing because the user chooses the target before writing the instruction. It also makes review easier: a teammate can see which object changed, which elements stayed locked, and which variation belongs to the current campaign. The result is a production workflow rather than another isolated generation box.'],
      ['Support repeatable work for commerce and marketing', 'Commerce teams repeatedly adapt the same product across seasonal campaigns, marketplaces, paid ads, email, and social channels. Marketing teams revise offers, headlines, colors, backgrounds, and decorations while brand elements must remain consistent. A structured project gives both groups one master creative instead of many unrelated files. Named layers clarify ownership, saved versions create review checkpoints, and non-destructive variations make approvals reversible. When a change performs well, the team can return to the same project and build the next format from proven work. That repeatability is more valuable than a single impressive output because it shortens every future revision.'],
      ['Keep the workspace understandable for non-designers', 'Professional capability does not require a complicated interface. The main path stays linear: upload, generate layers, select an object, choose an action, describe the change, compare, and export. Advanced controls appear only when they belong to the selected object. A product can expose preserve rules, a background can expose blur and restyling, and text can expose rewrite-oriented actions. Familiar controls for visibility, position, scale, rotation, opacity, undo, and zoom reduce the learning burden. People who already know design software can work quickly, while first-time users can complete the flow without learning masking terminology.'],
      ['Measure success by the first finished revision', 'The most important activation event is not account creation or a credit purchase. It is the moment a visitor uploads a real creative, selects one object, asks for a precise change, sees everything else remain stable, and downloads a result they can use. The free experience should protect that complete path. Pricing can appear after the user understands the value, with plans described through projects, exports, variants, brand protection, and production volume. This aligns the product with outcomes customers recognize and gives future development a clear test: every feature should make controlled revision faster, safer, or more repeatable.'],
    ],
  },
  zh: {
    title: '面向可控修改的专业图像编辑工作流',
    intro: 'Image Layered 是一个面向生成后修改的图像编辑工作台。用户通常已经拥有一张构图不错的图像，只希望修改其中一个物体，而不是让生成模型把整张图像重新画一遍。系统会把图像拆成可以选择、锁定、修改和导出的对象，让商品图、广告图、社交媒体素材、海报和 AI 图像的修改过程更加稳定、可控。',
    sections: [
      ['从已经正确的图像开始', '一张可用的图像里往往包含不能随意变化的内容，例如商品轮廓、人物身份、Logo、字体、光影或经过设计的版式。整图重新生成会把所有像素都变成不确定因素。图层式图像编辑采用相反的方法：原始图像是主版本，只有当前选中的对象允许被修改，因此每次图像调整都能保持与原稿的关系。'],
      ['把平面图像变成可编辑对象', '上传 JPG、PNG 或 WEBP 图像后，系统会生成结构化图层。图像分层会识别主体、商品、文字、背景、阴影和视觉效果。每一个图像对象都可以显示、隐藏、移动、缩放、旋转、复制、锁定或单独导出。固定范围的画布保证竖图、方图和横幅图像都在同一个稳定的编辑界面中显示。'],
      ['描述修改，而不是重建设计', '选择图像对象后，可以直接输入“把瓶子改成深绿色”“重写标题”或“把背景改成冬季影棚”等指令。Image Layered 只会把指令应用到当前图像图层，并保护其他图像内容。生成结果会成为新的变体图层，原来的图像对象仍然可以恢复，因此试验不会破坏原稿。'],
      ['锁定品牌关键元素', '商业团队经常需要制作多个活动版本，同时保证商品、Logo、标签或人物完全一致。图层锁定会把这种要求产品化。用户可以锁定关键图像对象，并勾选需要保留的轮廓、Logo、标签和阴影，再修改背景或装饰。系统会自动把这些限制加入 AI 图像指令。'],
      ['沉淀可以重复使用的商业资产', '一份分层图像比单张最终导出更有价值。单独的图像对象可以下载到其他设计工具，完整画面也能重新合成为 PNG。项目保存与版本历史让用户可以反复修改同一张图像，而不是每次重新生成。后续 Variants 能把主图像扩展成社交平台、电商平台和不同节日活动的多种版本。'],
    ],
  },
};

const toolCopy = {
  en: {
    title: 'How to use the Image Layered canvas',
    intro: 'The Image Layered tool is a canvas-based visual editor built for controlled AI revision. It combines a layer stack, a fixed canvas, contextual object properties, AI actions, locks, and non-destructive history in one workflow. The goal is simple: upload a source, create layers, select one object, describe one change, protect everything else, and export a useful result.',
    sections: [
      ['Upload or change the source image', 'Choose a file from the empty workspace or use Change image in the Studio header. The editor accepts common browser formats and prepares the file before layer generation. Replacing the source does not need to erase your work without warning: when a layered project exists, Image Layered creates a version snapshot before loading the replacement. The canvas then fits the new source inside the same fixed viewport. A tall artwork no longer stretches the page, and a wide banner no longer pushes the property panel away.'],
      ['Generate a useful image layer stack', 'Select the layer model and the desired layer count, then generate. The image decomposition model attempts to separate the source into meaningful objects such as the main subject, product, foreground, text, background, shadow, lighting, and effects. Poster-oriented modes use names such as headline, logo, body copy, and background plate. These names help the inspector present an action that matches the selected object instead of exposing a generic collection of unrelated tools.'],
      ['Navigate a real image canvas', 'The center workspace behaves like a professional canvas. Use Select to choose an object, Move or the Space key to pan the canvas, and Scale to resize the selected layer. The zoom control changes only the artwork view, not the surrounding page. Fit returns the entire composition to the available viewport. The artboard reports the original dimensions, while the checker surface makes transparent regions easier to recognize. Portrait, landscape, square, and panoramic files therefore share a consistent editing environment.'],
      ['Treat every image layer as an object', 'Selecting a layer opens its object inspector. Position fields control X and Y coordinates. Width and height control scale. Rotation changes the object angle around its center. Opacity and blend mode control how the visual object combines with layers below it. A background object also receives a real blur control. Visibility, lock, duplicate, download, and delete operations remain attached to the selected object, making the relationship between the layer stack, canvas, and properties explicit.'],
      ['Use AI actions on the selected object', 'Replace, Remove, Recolor, Rewrite, and Restyle are not separate destinations. They are contextual actions for the current layer. Select a product and Replace can create a new product variation. Select text and Rewrite changes the wording through the editing model. Select a background and Restyle can create a different scene. Each AI action creates a new variation layer and hides the source layer instead of overwriting it. You can compare, restore, or delete the image variation later.'],
      ['Protect the image with locks and preserve rules', 'Controlled revision depends on knowing what must not change. Lock any layer from the stack, or choose Lock others in the inspector to protect every image object except the current selection. For product objects, Preserve can protect shape, logo, label, and shadow. Image Layered automatically appends those constraints to the AI instruction. A request such as “make this a Christmas campaign” can therefore change the editable background and decorations while locked product and brand layers remain named as protected context.'],
      ['Write one focused Ask AI instruction', 'The Ask AI bar stays below the canvas because the prompt belongs to the editing session, not to a disconnected tool. Select the target image layer, choose the intended action, and describe the result in one sentence. Specific instructions work best: identify the desired material, color, object, environment, text, or mood, and state what should remain unchanged. Layer locks and Preserve settings are included automatically, so you do not need to rewrite the same protection language for every revision.'],
      ['Compare, save, and recover image work', 'Use Original and Result to inspect the current composite against the source. Undo and Redo cover immediate operations, while Versions creates named snapshots for larger checkpoints. Local autosave protects the active image project during refreshes and unexpected navigation. Signed-in users can also save the project to their account. These recovery layers are essential for professional image editing because experimentation should never force the user to lose an approved visual.'],
      ['Export the complete image or an individual layer', 'Export combines every visible image layer in z-index order while respecting position, size, rotation, opacity, blur, and blend mode. The PNG export runs locally and does not consume credits. An individual object can also be downloaded from its inspector. Keeping both export paths supports two real jobs: finishing a complete campaign image inside Image Layered, or moving a transparent asset into Photoshop, Figma, Canva, a marketplace listing, or another production workflow.'],
      ['Build variants from one master image', 'The current Studio establishes the structure required for variants: one master image, a stable layer graph, protected brand objects, editable campaign objects, version history, and repeatable actions. The next product layer can turn that master into square, portrait, and vertical image formats for Instagram, TikTok, Amazon, and Shopify. Campaign variants can reuse the same locked product while changing the background, offer, typography, decorations, or lighting for Summer, Black Friday, Christmas, Valentine, and Spring.'],
      ['Get a first successful image edit before upgrading', 'A new user should understand the product by completing an image result, not by reading a credit balance. The free path supports the essential sequence: upload a source, generate layers, select an object, enter an image edit, compare the result, and export. Paid plans should describe outcomes such as projects per month, layer editing, HD image export, variants, brand lock, commercial use, and priority processing. Credits can remain an internal cost control while the customer buys repeatable production.'],
      ['Choose a source that produces clean layers', 'A strong source image gives the model enough visual separation to identify useful objects. Use the highest quality image available and avoid a tiny preview that has already been compressed several times. Clear edges between the product and background usually create a cleaner image mask. Readable typography helps the system recognize text as its own image layer. Distinct shadows are easier to preserve when they are not baked into a noisy surface. If the first image decomposition produces too few objects, increase the requested count or try the poster-oriented mode. If it produces too many fragments, reduce the count and focus the source before trying again. The purpose is not to create the maximum number of layers; it is to create the smallest useful set for the intended revision. A catalog image may need product, label, shadow, and background, while a campaign image may also need headline, logo, offer, decorations, and lighting. Review the stack before editing, rename ambiguous objects, lock approved elements, and select the layer whose pixels actually contain the target. This short preparation makes every later prompt more precise and keeps the final image consistent. Before a large campaign, test one representative asset from start to export. Confirm that the target separates cleanly, the protected objects stay stable, the variation remains editable, and the final dimensions match the delivery channel. That rehearsal creates a repeatable recipe for the rest of the production set.'],
    ],
  },
  zh: {
    title: '如何使用 Image Layered 专业画布',
    intro: 'Image Layered 工具页现在以真正的 Canvas 为核心，把图像图层、固定画布、对象属性、AI Actions、锁定保护和非破坏式历史组织成一个连续工作流。用户只需要上传图像、生成图层、选择对象、描述修改、保护其他内容并导出结果。',
    sections: [
      ['上传或更换源图像', '从空白工作区选择图像，或者使用 Studio 顶部的“更换图片”。当项目已经存在多个图像图层时，系统会先自动创建版本快照，再载入新的图像。新图像会适配到固定范围的 Canvas 中，竖图不会把页面无限拉长，横图也不会把右侧属性面板挤出工作区。'],
      ['生成有意义的图像图层', '选择图像分层模型和目标图层数量后开始生成。模型会尝试把源图像拆成主体、商品、前景、文字、背景、阴影、光线和特效。海报模式还会识别标题、Logo、正文信息块和背景板。图层名称会帮助 Inspector 为不同图像对象提供不同操作。'],
      ['在真正的图像 Canvas 中操作', '中间工作区采用专业图像编辑器的 Canvas 逻辑。Select 用于选择对象，Move 或空格键用于平移画布，Scale 用于缩放当前图像对象。缩放百分比只改变 Canvas 视图，不会改变页面布局。Fit 会让整张图像重新适配固定视口。'],
      ['把每一个图像图层变成对象', '选择图层后，右侧 Inspector 会显示对象属性。X 和 Y 控制位置，宽度和高度控制尺寸，Rotation 控制旋转，Opacity 和 Blend Mode 控制图像合成方式。背景对象还拥有真实的模糊控制。显示、锁定、复制、下载和删除都围绕当前图像对象组织。'],
      ['对当前对象执行 AI Actions', 'Replace、Remove、Recolor、Rewrite 和 Restyle 不再是割裂的工具入口，而是当前图像图层的操作。选择商品后可以替换商品；选择文字后可以重写文案；选择背景后可以重塑场景。每次 AI 图像操作都会创建新的变体图层并保留源图层。'],
      ['使用锁定和 Preserve 保护图像', '可控图像修改的关键是明确哪些内容不能变化。用户可以在图层列表锁定任意对象，也可以在 Inspector 中一键锁定其他图层。商品对象还可以保留轮廓、Logo、标签和阴影。Image Layered 会把这些规则自动加入 AI 图像指令。'],
      ['在底部 Ask AI 输入明确指令', 'Ask AI 固定在 Canvas 下方，因为提示词属于整个编辑会话。选择目标图像图层和操作后，用一句话描述材料、颜色、物体、环境、文字或氛围。锁定图层和 Preserve 设置会自动生效，不需要用户在每一次图像修改时重复编写保护要求。'],
      ['对比、保存和恢复图像项目', 'Original 与 Result 用于检查当前合成结果和源图像。Undo 与 Redo 处理即时操作，Versions 用于保存重要节点。本地自动保存可以在刷新或意外离开后恢复图像项目，登录用户还可以把项目保存到账号。专业图像编辑必须允许用户安全试验。'],
      ['导出完整图像或单独图层', 'Export 会按照图层顺序合成所有可见图像对象，并保留位置、尺寸、旋转、透明度、模糊和混合模式。PNG 导出在本地完成，不消耗积分。用户也可以从 Inspector 下载单独图像对象，用于 Photoshop、Figma、Canva 或其他生产流程。'],
      ['从主图像建立商业 Variants', '当前 Studio 已经具备 Variants 的基础结构：主图像、稳定图层、品牌锁定、可编辑对象、版本历史和可重复 AI 操作。下一阶段可以把主图像扩展为 Instagram、TikTok、Amazon 和 Shopify 所需比例，并制作 Summer、Black Friday、Christmas、Valentine 和 Spring 等活动版本。'],
      ['先让用户免费完成第一次成功', '新用户应该通过真实图像结果理解产品，而不是先理解积分。免费路径需要覆盖上传图像、生成图层、选择对象、输入图像修改、对比结果和导出。付费方案应该销售每月项目数量、图层编辑、高清图像导出、Variants、Brand Lock 和商业使用等明确成果。'],
    ],
  },
};

export default function ImageLayeredSeoGuide({ locale, surface }: SeoGuideProps) {
  const language = locale === 'zh' ? 'zh' : 'en';
  const content = surface === 'home' ? homeCopy[language] : toolCopy[language];

  return (
    <section className="border-t border-white/[0.06] bg-[#0b090d] px-4 py-16 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-[1120px]">
        <h2 className="max-w-4xl text-3xl font-black tracking-[-0.025em] text-white md:text-4xl">{content.title}</h2>
        <p className="mt-6 max-w-[74ch] text-base leading-8 text-[#aaa4b1]">{content.intro}</p>
        <div className="mt-12 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {content.sections.map(([title, text]) => (
            <article key={title} className="grid gap-3 py-7 md:grid-cols-[minmax(220px,0.38fr)_minmax(0,1fr)] md:gap-10">
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="max-w-[75ch] text-sm leading-7 text-[#9993a3]">{text}</p>
            </article>
          ))}
        </div>
        <nav className="mt-10 flex flex-wrap gap-3" aria-label={language === 'zh' ? '相关页面' : 'Related pages'}>
          <Link href={`/${locale}/qwenimagelayered`} className="rounded-xl bg-[#f33b72] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#ff4f83]">
            {language === 'zh' ? '打开图像编辑器' : 'Open the image editor'}
          </Link>
          <Link href={`/${locale}/qwenimagelayered/guide`} className="rounded-xl bg-white/[0.055] px-4 py-2.5 text-sm font-bold text-[#d8d2dc] hover:bg-white/[0.09] hover:text-white">
            {language === 'zh' ? '阅读图像分层指南' : 'Read the image layering guide'}
          </Link>
          <Link href={`/${locale}/pricing`} className="rounded-xl bg-white/[0.055] px-4 py-2.5 text-sm font-bold text-[#d8d2dc] hover:bg-white/[0.09] hover:text-white">
            {language === 'zh' ? '查看方案' : 'View plans'}
          </Link>
        </nav>
      </div>
    </section>
  );
}
