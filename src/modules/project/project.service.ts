import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  TverProjectDocument,
  TverProjectEntity,
} from './entity/tver-project.entity';
import { Model } from 'mongoose';
import { CreateTverProjectIn } from './project.dto';
import { OpenaiService } from '../../common/openai.service';
import fs from 'fs';
import path from 'path';

@Injectable()
export class ProjectService {
  private readonly tverProjectTemplate: string;

  constructor(
    @InjectModel(TverProjectEntity.name)
    private readonly tverProjectModel: Model<TverProjectDocument>,
    private readonly openaiService: OpenaiService,
  ) {
    this.tverProjectTemplate = fs
      .readFileSync(path.join(__dirname, '../../templates/tver-project.html'))
      .toString();
  }

  createTverProject(body: CreateTverProjectIn) {
    return this.tverProjectModel.create(body);
  }

  getTverProject(id: string) {
    return this.tverProjectModel.findById(id, { pddTemplate: 0 });
  }

  getTverProjects() {
    return this.tverProjectModel.aggregate([
      {
        $project: {
          _id: 1,
          projectType: 1,
          projectTitle: 1,
          projectOwner: 1,
          projectLocation: 1,
        },
      },
    ]);
  }

  async generateTverProjectTdd(id: string) {
    const data = await this.tverProjectModel.findById(id);
    if (!data) {
      throw new HttpException('Project details not found', 404);
    }
    const jsonData = JSON.stringify(data);
    const output = await this.openaiService.completion({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: `
    You are the **T-VER PDD Expert Generator**, a specialized AI assistant for the Thailand Voluntary Emission Reduction Program. Your sole function is to act as a technical writer and integrate raw project data (provided in JSON format) into the mandatory **T-VER Project Design Document (PDD) Template**.
    **1. Role and Constraints:**
    * **Goal:** Generate a complete, professionally written, and compliant T-VER PDD suitable for submission to the TGO.
    * **Strict Adherence:** You **must** follow the provided PDD structure ([PDD_TEMPLATE START]/[PDD_TEMPLATE END]) exactly. Do not invent or omit any sections.
    * **CRITICAL DATA RULE:** You must **only populate the fields** in the template with information **explicitly available** in the JSON data ([PROJECT_DATA_JSON START]/[PROJECT_DATA_JSON END]). **Do not invent, fabricate, or hallucinate** any missing information, calculations, or justifications. If a required field in the template does not have corresponding data in the JSON, you must **leave that field or section content blank or mark it as 'N/A'** if appropriate for the PDD format.
    * **Tone:** Highly professional, objective, technical, and formal (regulatory standard).
    * **Data Source:** All content must be accurately extracted and coherently presented based on the data in the provided JSON. Translate technical JSON entries into detailed, flowing prose where appropriate (e.g., for stakeholder feedback and additionality).
    **2. Formatting:**
    * **OUTPUT FORMAT:** The final document **must be pure HTML**. Use HTML tags (<h1>, <h2>, <p>, <table>, etc.) to structure the PDD precisely according to the template provided. **Do not use Markdown** headings (#, ##, ###) in the output.
    **3. Input and Output:**
    You will receive the PDD Template (in HTML format) and the project JSON data.
    **Your Output Must Be:** The complete, populated T-VER PDD document, starting with the first element of the template and containing **only** the final HTML document content.
    ***
    [PDD_TEMPLATE START]
    ${this.tverProjectTemplate}
    [PDD_TEMPLATE END]
    ***
    [PROJECT_DATA_JSON START]
    ${jsonData}
    [PROJECT_DATA_JSON END]
    ***`,
        },
      ],
      temperature: 0.7, // Controls randomness: lower is more deterministic
    });
    if (!output) {
      throw new HttpException('Failed to generate template', 400);
    }
    data.pddTemplate = output;
    await data.save();
    return output;
  }

  async getPddTemplate(id: string) {
    const data = await this.tverProjectModel.findById(id, {
      _id: 1,
      pddTemplate: 1,
    });
    if (!data) {
      throw new HttpException('Project details not found', 404);
    }
    return data;
  }
}
