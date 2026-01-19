import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { JwtOptionalAuthGuard } from "../auth/guards/jwt-optional.guard";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { Request } from "express";

type AuthRequest = Request & { user?: { userId: string; email: string } };

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get("search")
  @UseGuards(JwtAuthGuard)
  async getSearch(@Req() req: AuthRequest) {
    return this.documentsService.getSearch(req.user?.userId ?? "");
  }

  @Get("trash")
  @UseGuards(JwtAuthGuard)
  async getTrash(@Req() req: AuthRequest) {
    return this.documentsService.getTrash(req.user?.userId ?? "");
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSidebar(
    @Req() req: AuthRequest,
    @Query("parentDocumentId") parentDocumentId?: string,
  ) {
    return this.documentsService.getSidebar(
      req.user?.userId ?? "",
      parentDocumentId,
    );
  }

  @Get(":id")
  @UseGuards(JwtOptionalAuthGuard)
  async getById(@Param("id") id: string, @Req() req: AuthRequest) {
    return this.documentsService.getById(id, req.user?.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: AuthRequest, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(req.user?.userId ?? "", dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(req.user?.userId ?? "", id, dto);
  }

  @Post(":id/archive")
  @UseGuards(JwtAuthGuard)
  async archive(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documentsService.archive(req.user?.userId ?? "", id);
  }

  @Post(":id/restore")
  @UseGuards(JwtAuthGuard)
  async restore(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documentsService.restore(req.user?.userId ?? "", id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documentsService.remove(req.user?.userId ?? "", id);
  }

  @Post(":id/remove-icon")
  @UseGuards(JwtAuthGuard)
  async removeIcon(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documentsService.removeIcon(req.user?.userId ?? "", id);
  }

  @Post(":id/remove-cover")
  @UseGuards(JwtAuthGuard)
  async removeCover(@Req() req: AuthRequest, @Param("id") id: string) {
    return this.documentsService.removeCoverImage(req.user?.userId ?? "", id);
  }
}
