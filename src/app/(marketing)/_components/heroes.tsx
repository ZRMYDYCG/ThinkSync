import Image from 'next/image'

const Heroes = () => {
  return (
    <div className="flex max-w-5xl flex-col items-center justify-center">
      <div className="flex items-center">
        <div className="relative h-[300px] w-[300px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px]">
          <Image
            src="/documents.png"
            alt="Documents"
            fill
            className="object-contain dark:hidden"
          ></Image>
          <Image
            src="/documents-dark.png"
            alt="Documents"
            fill
            className="hidden object-contain dark:block"
          ></Image>
        </div>
        <div className="relative hidden h-[400px] w-[400px] md:block">
          <Image
            src="/reading.png"
            alt="Reading"
            fill
            className="object-contain dark:hidden"
          ></Image>
          <Image
            src="/reading-dark.png"
            alt="Reading"
            fill
            className="hidden object-contain dark:block"
          ></Image>
        </div>
      </div>
    </div>
  )
}

export default Heroes
