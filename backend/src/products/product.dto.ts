import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt, Min, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsUrl()
  image: string;

  @IsString()
  @IsNotEmpty()
  category: string;
}
